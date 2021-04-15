import { NextApiRequest, NextApiResponse } from 'next';
import Valist, { Web3Providers } from 'valist';

export default async function getReleaseByTag(req: NextApiRequest, res: NextApiResponse) {
  console.log('Pulling package by version tag');
  // set .env.local to your local chain or set in production deployment
  if (process.env.WEB3_PROVIDER) {
    const valist = new Valist({
      web3Provider: new Web3Providers.HttpProvider(process.env.WEB3_PROVIDER),
      metaTx: false,
    });
    await valist.connect();

    const {
      query: { releaseName, tag },
    } = req;

    const [orgName, repoName] = decodeURIComponent(releaseName.toString().replace('@', '')).split('/');
    const release = await valist.getReleaseByTag(orgName, repoName, tag.toString());

    if (release) {
      return res.status(200).json({
        name: repoName,
        version: release.tag,
        repository: '',
        contributors: '',
        bugs: '',
        homepage: '',
        dependencies: {},
        dist: {
          tarball: `https://ipfs.fleek.co/ipfs/${release.releaseCID}`,
        },
      });
    }
    return res.status(404).json({ statusCode: 404, message: 'No release found!' });
  }
  return res.status(500).json({ statusCode: 500, message: 'No Web3 Provider!' });
}