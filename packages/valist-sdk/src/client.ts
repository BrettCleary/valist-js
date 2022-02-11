import { providers } from 'ethers';
import { TeamMeta, ProjectMeta, ReleaseMeta, Contract } from './index';
import { StorageAPI } from './storage';
import { ContractAPI } from './contract';
import { createIPFS } from './storage/ipfs';
import { addresses } from './contract/evm';

export class Client {
	public contract: ContractAPI;
	public storage: StorageAPI;

	constructor(contract: ContractAPI, storage: StorageAPI) {
		this.contract = contract;
		this.storage = storage;
	}

	async getTeamMeta(teamName: string): Promise<TeamMeta> {
		const metaURI = await this.contract.getTeamMetaURI(teamName);
		return await this.storage.readTeamMeta(metaURI);
	}

	async getProjectMeta(teamName: string, projectName: string): Promise<ProjectMeta> {
		const metaURI = await this.contract.getProjectMetaURI(teamName, projectName);
		return await this.storage.readProjectMeta(metaURI);
	}

	async getReleaseMeta(teamName: string, projectName: string, releaseName: string): Promise<ReleaseMeta> {
		const metaURI = await this.contract.getReleaseMetaURI(teamName, projectName, releaseName);
		return await this.storage.readReleaseMeta(metaURI);
	}

	async getLatestReleaseMeta(teamName: string, projectName: string): Promise<ReleaseMeta> {
		const releaseName = await this.contract.getLatestReleaseName(teamName, projectName);
		return await this.getReleaseMeta(teamName, projectName, releaseName);
	}

	async createTeam(teamName: string, team: TeamMeta, beneficiary: string, members: string[]): Promise<void> {
		const metaURI = await this.storage.writeTeamMeta(team);
		await this.contract.createTeam(teamName, metaURI, beneficiary, members);
	}

	async createProject(teamName: string, projectName: string, project: ProjectMeta, members: string[]): Promise<void> {
		const metaURI = await this.storage.writeProjectMeta(project);
		await this.contract.createProject(teamName, projectName, metaURI, members);
	}

	async createRelease(teamName: string, projectName: string, releaseName: string, release: ReleaseMeta): Promise<void> {
		const metaURI = await this.storage.writeReleaseMeta(release);
		await this.contract.createRelease(teamName, projectName, releaseName, metaURI);
	}

	async setTeamBeneficiary(teamName: string, beneficiary: string): Promise<void> {
		await this.contract.setTeamBeneficiary(teamName, beneficiary);
	}

	async getTeamBeneficiary(teamName: string): Promise<string> {
		return await this.contract.getTeamBeneficiary(teamName);
	}
}

export const createClient = async ({ web3Provider }: { web3Provider: providers.Web3Provider }): Promise<Client> => {
	const chainID = await web3Provider.getSigner().getChainId();
	const address = addresses[chainID];

	const storage = createIPFS();
	const contract = new Contract.EVM(address, web3Provider);

	const client = new Client(contract, storage);
	return client;
};
