import { ApolloCache } from '@apollo/client';
import { Client } from '@valist/sdk';
import { handleEvent } from './events';
import * as utils from './utils';

export async function setProductRoyalty(
  address: string | undefined,
  projectId: string,
  recipient: string,
  amount: number,
  valist: Client,
  cache: ApolloCache<any>,
): Promise<boolean | undefined> {
  try {
    utils.hideError();

    if (!address) {
      throw new Error('connect your wallet to continue');
    }

    utils.showLoading('Waiting for transaction');
    const transaction = await valist.setProductRoyalty(projectId, recipient, amount);
    const receipt = await transaction.wait();
    receipt.events?.forEach(event => handleEvent(event, cache));

    return true;
  } catch (error: any) {
    utils.showError(error);
    console.log(error);
  } finally {
    utils.hideLoading();
  }
}

export async function setProductLimit(
  address: string | undefined,
  projectId: string,
  limit: number,
  valist: Client,
  cache: ApolloCache<any>,
): Promise<boolean | undefined> {
  try {
    utils.hideError();

    if (!address) {
      throw new Error('connect your wallet to continue');
    }

    utils.showLoading('Creating transaction');
    const transaction = await valist.setProductLimit(projectId, limit);

    utils.updateLoading('Waiting for transaction', transaction.hash);
    const receipt = await transaction.wait();
    receipt.events?.forEach(event => handleEvent(event, cache));

    return true;
  } catch (error: any) {
    utils.showError(error);
    console.log(error);
  } finally {
    utils.hideLoading();
  }
}

export async function setProductPrice(
  address: string | undefined,
  projectId: string,
  price: number,
  valist: Client,
  cache: ApolloCache<any>,
): Promise<boolean | undefined> {
  try {
    utils.hideError();

    if (!address) {
      throw new Error('connect your wallet to continue');
    }

    utils.showLoading('Waiting for transaction');
    const transaction = await valist.setProductPrice(projectId, price);
    const receipt = await transaction.wait();
    receipt.events?.forEach(event => handleEvent(event, cache));

    return true;
  } catch (error: any) {
    utils.showError(error);
    console.log(error);
  } finally {
    utils.hideLoading();
  }
}

export async function withdrawProductBalance(
  address: string | undefined,
  projectId: string,
  recipient: string,
  valist: Client,
  cache: ApolloCache<any>,
): Promise<boolean | undefined> {
    try {
    utils.hideError();

    if (!address) {
      throw new Error('connect your wallet to continue');
    }

    utils.showLoading('Waiting for transaction');
    const transaction = await valist.withdrawProductBalance(projectId, recipient);
    const receipt = await transaction.wait();
    receipt.events?.forEach(event => handleEvent(event, cache));

    return true;
  } catch (error: any) {
    utils.showError(error);
    console.log(error);
  } finally {
    utils.hideLoading();
  }
}
