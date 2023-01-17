import { z } from 'zod';
import { ApolloCache } from '@apollo/client';
import { ProjectMeta, Client, GalleryMeta } from '@valist/sdk';
import { handleEvent } from './events';
import * as utils from './utils';
import { normalizeError, refineYouTube } from './common';
import { Anchor } from '@mantine/core';
import { getBlockExplorer } from '@/components/Activity';

export interface FormValues {
  displayName: string;
  website: string;
  description: string;
  shortDescription: string;
  youTubeLink: string;
  type: string;
  donationAddress: string;
  tags: string[];
  launchExternal: boolean;
  promptDonation: boolean;
  linkRepository: boolean;
}

export const schema = z.object({
  displayName: z.string()
    .min(3, { message: 'Display name should have at least 3 characters' })
    .max(24, { message: 'Display name should not be longer than 32 characters' }),
  website: z.string(),
  description: z.string(),
  youTubeLink: z.string()
    .refine(refineYouTube, { message: 'YouTube link format is invalid.' }),
  shortDescription: z.string()
    .max(100, { message: 'Description should be shorter than 100 characters' }),
  type: z.string(),
  tags: z.string().array(),
  promptDonation: z.boolean(),
  launchExternal: z.boolean(),
  linkRepository: z.boolean(),
});

const isFile = (file: File | String): file is File => {
  return (file as File).lastModified !== undefined;
};

export async function updateProject(
  address: string | undefined,
  projectId: string,
  oldMeta: ProjectMeta | undefined,
  youTubeLink: string,
  image: File | undefined,
  mainCapsule: File | undefined,
  newGallery: (File | String)[],
  values: FormValues,
  valist: Client,
  cache: ApolloCache<any>,
  chainId: number,
): Promise<boolean | undefined> {
  try {
  	utils.hideError();

    if (!address) throw new Error('connect your wallet to continue');
    if (!oldMeta) return;

    const meta: ProjectMeta = {
      image: oldMeta.image,
      main_capsule: oldMeta.main_capsule,
      name: values.displayName,
      short_description: values.shortDescription,
      description: values.description,
      external_url: values.website,
      type: values.type,
      tags: values.tags,
      gallery: oldMeta.gallery,
      repository: oldMeta.repository,
      launch_external: values.launchExternal,
      donation_address: values.donationAddress,
      prompt_donation: values.promptDonation,
    };
    
    utils.showLoading('Uploading files');
    
    if (image) {
      meta.image = await valist.writeFile(image, false, (progress: number) => {
        utils.updateLoading(`Uploading ${image.name}: ${progress}%`);
      });
    };

    if (mainCapsule) {
      meta.main_capsule = await valist.writeFile(mainCapsule, false, (progress: number) => {
        utils.updateLoading(`Uploading ${mainCapsule.name}: ${progress}%`);
      });
    };

    const ytChanged = values.youTubeLink !== youTubeLink;
    const galleryChanged = newGallery.length > 0;
    if (ytChanged || galleryChanged) meta.gallery = [];

    if (values.youTubeLink) {
      const src = values.youTubeLink;
      meta.gallery?.push({ name: '', type: 'youtube', src });
    };

    if (newGallery.length > 0) {
      for (const item of newGallery) {
        if (typeof item === 'string') {
          meta.gallery?.push({ name: '', type: 'image', src: item });
        } else if (isFile(item)) {
          const src = await valist.writeFile(item, false, (progress: number) => {  
            utils.updateLoading(`Uploading ${item.name}: ${progress}%`);
          });
          meta.gallery?.push({ name: '', type: 'image', src });
        }
      };
    } else {
      const galleryImages = oldMeta.gallery?.filter((item: GalleryMeta) => item.type === 'image') || [];
      for (const item of galleryImages) {
        meta.gallery?.push(item);
      }
    }

    utils.updateLoading('Creating transaction');
    const transaction = await valist.setProjectMeta(projectId, meta);
    
    const message = <Anchor target="_blank"  href={getBlockExplorer(chainId, transaction.hash)}>Waiting for transaction - View transaction</Anchor>;
    utils.updateLoading(message);

    const receipt = await transaction.wait();
    receipt.events?.forEach(event => handleEvent(event, cache));

    return true;
  } catch(error: any) {
    utils.showError(normalizeError(error));
  } finally {
    utils.hideLoading();
  };
};

export async function addProjectMember(
  address: string | undefined,
  projectId: string,
  member: string,
  valist: Client,
  cache: ApolloCache<any>,
  chainId: number,
): Promise<boolean | undefined> {
  try {
    utils.hideError();

    if (!address) {
      throw new Error('connect your wallet to continue');
    }

    utils.showLoading('Creating transaction');
    const transaction = await valist.addProjectMember(projectId, member);
    
    const message = <Anchor target="_blank"  href={getBlockExplorer(chainId, transaction.hash)}>Waiting for transaction - View transaction</Anchor>;
    utils.updateLoading(message);

    const receipt = await transaction.wait();
    receipt.events?.forEach(event => handleEvent(event, cache));

    return true;
  } catch (error: any) {
    utils.showError(normalizeError(error));
  } finally {
    utils.hideLoading();
  }
}

export async function removeProjectMember(
  address: string | undefined,
  projectId: string,
  member: string,
  valist: Client,
  cache: ApolloCache<any>,
  chainId: number,
): Promise<boolean | undefined> {
  try {
    utils.hideError();

    if (!address) {
      throw new Error('connect your wallet to continue');
    }

    utils.showLoading('Waiting for transaction');
    const transaction = await valist.removeProjectMember(projectId, member);
    
    const message = <Anchor target="_blank"  href={getBlockExplorer(chainId, transaction.hash)}>Waiting for transaction - View transaction</Anchor>;
    utils.updateLoading(message);
    
    const receipt = await transaction.wait();
    receipt.events?.forEach(event => handleEvent(event, cache));

    return true;
  } catch (error: any) {
    utils.showError(normalizeError(error));
  } finally {
    utils.hideLoading();
  }
}