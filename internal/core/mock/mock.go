package mock

import (
	"context"
	"fmt"
	"math/big"
	"os"
	"path/filepath"

	"github.com/dgraph-io/badger/v3"
	"github.com/ethereum/go-ethereum/accounts/abi/bind/backends"
	"github.com/ethereum/go-ethereum/accounts/keystore"
	"github.com/ethereum/go-ethereum/core"

	"github.com/valist-io/valist/internal/contract"
	"github.com/valist-io/valist/internal/core/client"
	"github.com/valist-io/valist/internal/core/client/basetx"
	"github.com/valist-io/valist/internal/signer"
	"github.com/valist-io/valist/internal/storage/ipfs"
)

const (
	veryLightScryptN = 2
	veryLightScryptP = 1
	passphrase       = "secret"
)

var (
	chainID  = big.NewInt(1337)
	gasLimit = uint64(8000000)
	balance  = big.NewInt(9223372036854775807)
)

func NewKeyStore(ksLocation string, numAccounts int) (*keystore.KeyStore, error) {
	kstore := keystore.NewKeyStore(ksLocation, veryLightScryptN, veryLightScryptP)

	for i := 0; i < numAccounts; i++ {
		account, err := kstore.NewAccount(passphrase)
		if err != nil {
			return nil, err
		}

		if err := kstore.Unlock(account, passphrase); err != nil {
			return nil, err
		}
	}

	return kstore, nil
}

func NewClient(ctx context.Context, kstore *keystore.KeyStore) (*client.Client, error) {
	tmp, err := os.MkdirTemp("", "")
	if err != nil {
		return nil, err
	}

	accounts := kstore.Accounts()
	if len(accounts) == 0 {
		return nil, fmt.Errorf("cannot create mock client with empty keystore")
	}

	alloc := make(core.GenesisAlloc)
	for _, account := range accounts {
		alloc[account.Address] = core.GenesisAccount{
			Balance: balance,
		}
	}

	signer, err := signer.NewSigner(chainID, kstore)
	if err != nil {
		return nil, err
	}

	// always default to first account
	signer.SetAccount(accounts[0])

	txopts := signer.NewTransactor()
	backend := backends.NewSimulatedBackend(alloc, gasLimit)

	forwarderAddress, _, _, err := contract.DeployForwarder(&txopts.TransactOpts, backend, accounts[0].Address)
	if err != nil {
		return nil, err
	}

	valistAddress, _, valist, err := contract.DeployValist(&txopts.TransactOpts, backend, forwarderAddress)
	if err != nil {
		return nil, err
	}

	registryAddress, _, registry, err := contract.DeployRegistry(&txopts.TransactOpts, backend, forwarderAddress)
	if err != nil {
		return nil, err
	}

	// ensure contracts are deployed
	backend.Commit()

	ipfs, err := ipfs.NewProvider(ctx, filepath.Join(tmp, "storage"))
	if err != nil {
		return nil, err
	}

	transactor, err := basetx.NewTransactor(backend, valistAddress, registryAddress)
	if err != nil {
		return nil, err
	}

	tmp, err := os.MkdirTemp("", "")
	if err != nil {
		return nil, err
	}

	db, err := badger.Open(badger.DefaultOptions(tmp))
	if err != nil {
		return nil, err
	}

	return client.NewClient(client.Options{
		Database:   db,
		Storage:    ipfs.NewStorage(ipfsapi),
		Ethereum:   backend,
		Valist:     valist,
		Registry:   registry,
		Signer:     signer,
		Transactor: transactor,
	})
}
