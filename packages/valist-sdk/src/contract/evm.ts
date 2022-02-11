import { ContractAPI } from './index';
import { Contract, Signer, BigNumber } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import * as local from '@valist/evm-contracts/deployments/local/Valist.json';
import * as mumbai from '@valist/evm-contracts/deployments/mumbai/Valist.json';

export class EVM implements ContractAPI {
	contract: Contract;

	constructor(address: string, signerOrProvider: Signer | Provider) {
		this.contract = new Contract(address, local.abi, signerOrProvider);
	}

	async createTeam(teamName: string, metaURI: string, beneficiary: string, members: string[]): Promise<void> {
		const tx = await this.contract.createTeam(teamName, metaURI, beneficiary, members);
		await tx.wait();
	}

	async createProject(teamName: string, projectName: string, metaURI: string, members: string[]): Promise<void> {
		const tx = await this.contract.createProject(teamName, projectName, metaURI, members);
		await tx.wait();
	}

	async createRelease(teamName: string, projectName: string, releaseName: string, metaURI: string): Promise<void> {
		const tx = await this.contract.createRelease(teamName, projectName, releaseName, metaURI);
		await tx.wait();
	}

	async addTeamMember(teamName: string, address: string): Promise<void> {
		const tx = await this.contract.addTeamMember(teamName, address);
		await tx.wait();
	}

	async removeTeamMember(teamName: string, address: string): Promise<void> {
		const tx = await this.contract.removeTeamMember(teamName, address);
		await tx.wait();
	}

	async addProjectMember(teamName: string, projectName: string, address: string): Promise<void> {
		const tx = await this.contract.addProjectMember(teamName, projectName, address);
		await tx.wait();
	}

	async removeProjectMember(teamName: string, projectName: string, address: string): Promise<void> {
		const tx = await this.contract.removeProjectMember(teamName, projectName, address);
		await tx.wait();
	}

	async setTeamMetaURI(teamName: string, metaURI: string): Promise<void> {
		const tx = await this.contract.setTeamMetaURI(teamName, metaURI);
		await tx.wait();
	}

	async setProjectMetaURI(teamName: string, projectName: string, metaURI: string): Promise<void> {
		const tx = await this.contract.setProjectMetaURI(teamName, projectName, metaURI);
		await tx.wait();
	}

	async setTeamBeneficiary(teamName: string, beneficiary: string): Promise<void> {
		const teamID = await this.contract.getTeamID(teamName);
		const tx = await this.contract.setTeamBeneficiary(teamID, beneficiary);
		await tx.wait();
	}

	async approveRelease(teamName: string, projectName: string, releaseName: string): Promise<void> {
		const tx = await this.contract.approveRelease(teamName, projectName, releaseName);
		await tx.wait();
	}

	async rejectRelease(teamName: string, projectName: string, releaseName: string): Promise<void> {
		const tx = await this.contract.rejectRelease(teamName, projectName, releaseName);
		await tx.wait();
	}

	async getLatestReleaseName(teamName: string, projectName: string): Promise<string> {
		return await this.contract.getLatestRelease(teamName, projectName);
	}

	async getTeamMetaURI(teamName: string): Promise<string> {
		return await this.contract.getTeamMetaURI(teamName);
	}

	async getProjectMetaURI(teamName: string, projectName: string): Promise<string> {
		return await this.contract.getProjectMetaURI(teamName, projectName);
	}

	async getReleaseMetaURI(teamName: string, projectName: string, releaseName: string): Promise<string> {
		return await this.contract.getReleaseMetaURI(teamName, projectName, releaseName);
	}

	async getTeamNames(page: BigNumber, size: BigNumber): Promise<string[]> {
		return await this.contract.getTeamNames(page, size);
	}

	async getProjectNames(teamName: string, page: BigNumber, size: BigNumber): Promise<string[]> {
		return await this.contract.getProjectNames(teamName, page, size);
	}

	async getReleaseNames(teamName: string, projectName: string, page: BigNumber, size: BigNumber): Promise<string[]> {
		return await this.contract.getReleaseNames(teamName, projectName, page, size);
	}

	async getTeamMembers(teamName: string, page: BigNumber, size: BigNumber): Promise<string[]> {
		return await this.contract.getTeamMembers(teamName, page, size);
	}

	async getTeamBeneficiary(teamName: string): Promise<string> {
		const teamID = await this.contract.getTeamID(teamName);
		return await this.contract.getTeamBeneficiary(teamID);
	}

	async getProjectMembers(teamName: string, projectName: string, page: BigNumber, size: BigNumber): Promise<string[]> {
		return await this.contract.getProjectMembers(teamName, projectName, page, size);
	}

	async getReleaseApprovers(teamName: string, projectName: string, releaseName: string, page: BigNumber, size: BigNumber): Promise<string[]> {
		return await this.contract.getReleaseApprovers(teamName, projectName, releaseName, page, size);
	}

	async getReleaseRejectors(teamName: string, projectName: string, releaseName: string, page: BigNumber, size: BigNumber): Promise<string[]> {
		return await this.contract.getReleaseRejectors(teamName, projectName, releaseName, page, size);
	}

	async getTeamID(teamName: string): Promise<BigNumber> {
		return await this.contract.getTeamID(teamName);
	}

	async getProjectID(teamID: BigNumber, projectName: string): Promise<BigNumber> {
		return await this.contract.getProjectID(teamID, projectName);
	}

	async getReleaseID(projectID: BigNumber, releaseName: string): Promise<BigNumber> {
		return await this.contract.getReleaseID(projectID, releaseName);
	}
}

export const addresses: {[chainID: number]: string} = {
	// Deterministic Ganache
	1337: local.address,
	// Polygon testnet
	80001: mumbai.address,
	// Polygon mainnet
	// 137: polygon.address,
};

export const abis: {[chainID: number]: any} = {
	// Deterministic Ganache
	1337: local.abi,
	// Polygon testnet
	80001: mumbai.abi,
	// Polygon mainnet
	// 137: polygon.abi,
};