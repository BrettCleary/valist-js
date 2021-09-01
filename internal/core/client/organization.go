package client

import (
	"context"
	"encoding/json"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ipfs/go-cid"

	"github.com/valist-io/registry/internal/contract/valist"
	"github.com/valist-io/registry/internal/core/types"
)

// GetOrganization returns the organization with the given ID.
func (client *Client) GetOrganization(ctx context.Context, id common.Hash) (*types.Organization, error) {
	callopts := bind.CallOpts{
		Context: ctx,
		From:    client.account.Address,
	}

	org, err := client.valist.Orgs(&callopts, id)
	if err != nil {
		return nil, fmt.Errorf("Failed to get organization id: %v", err)
	}

	// TODO there's no way to check if an org exists

	metaCID, err := cid.Decode(org.MetaCID)
	if err != nil {
		return nil, fmt.Errorf("Failed to parse organization meta CID: %v", err)
	}

	return &types.Organization{
		ID:            id,
		Threshold:     org.Threshold,
		ThresholdDate: org.ThresholdDate,
		MetaCID:       metaCID,
	}, nil
}

// GetOrganizationMeta returns the organization meta with the given CID.
func (client *Client) GetOrganizationMeta(ctx context.Context, id cid.Cid) (*types.OrganizationMeta, error) {
	data, err := client.ReadFile(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("Failed to get organization meta: %v", err)
	}

	var meta types.OrganizationMeta
	if err := json.Unmarshal(data, &meta); err != nil {
		return nil, fmt.Errorf("Failed to parse organization meta: %v", err)
	}

	return &meta, nil
}

func (client *Client) CreateOrganization(ctx context.Context, meta *types.OrganizationMeta) (*valist.ValistOrgCreated, error) {
	data, err := json.Marshal(meta)
	if err != nil {
		return nil, err
	}

	metaCID, err := client.WriteFile(ctx, data)
	if err != nil {
		return nil, err
	}

	txopts := client.transactOpts(client.account, client.wallet, client.chainID)
	txopts.Context = ctx

	tx, err := client.transactor.CreateOrganizationTx(txopts, metaCID)
	if err != nil {
		return nil, err
	}

	logs, err := waitMined(ctx, client.eth, tx)
	if err != nil {
		return nil, err
	}

	return client.valist.ParseOrgCreated(*logs[0])
}

func (client *Client) SetOrganizationMeta(ctx context.Context, orgID common.Hash, meta *types.OrganizationMeta) (*valist.ValistMetaUpdate, error) {
	data, err := json.Marshal(meta)
	if err != nil {
		return nil, err
	}

	metaCID, err := client.WriteFile(ctx, data)
	if err != nil {
		return nil, err
	}

	txopts := client.transactOpts(client.account, client.wallet, client.chainID)
	txopts.Context = ctx

	tx, err := client.transactor.SetOrganizationMetaTx(txopts, orgID, metaCID)
	if err != nil {
		return nil, err
	}

	logs, err := waitMined(ctx, client.eth, tx)
	if err != nil {
		return nil, err
	}

	return client.valist.ParseMetaUpdate(*logs[0])
}

func (client *Client) VoteOrganizationAdmin(ctx context.Context, orgID common.Hash, operation common.Hash, address common.Address) (*valist.ValistVoteKeyEvent, error) {
	txopts := client.transactOpts(client.account, client.wallet, client.chainID)
	txopts.Context = ctx

	tx, err := client.transactor.VoteKeyTx(txopts, orgID, "", operation, address)
	if err != nil {
		return nil, err
	}

	logs, err := waitMined(ctx, client.eth, tx)
	if err != nil {
		return nil, err
	}

	return client.valist.ParseVoteKeyEvent(*logs[0])
}

func (client *Client) VoteOrganizationThreshold(ctx context.Context, orgID common.Hash, threshold *big.Int) (*valist.ValistVoteThresholdEvent, error) {
	txopts := client.transactOpts(client.account, client.wallet, client.chainID)
	txopts.Context = ctx

	tx, err := client.transactor.VoteOrganizationThresholdTx(txopts, orgID, threshold)
	if err != nil {
		return nil, err
	}

	logs, err := waitMined(ctx, client.eth, tx)
	if err != nil {
		return nil, err
	}

	return client.valist.ParseVoteThresholdEvent(*logs[0])
}
