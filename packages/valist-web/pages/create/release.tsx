import Layout from '../../components/Layouts/Main';
import ValistContext from '../../features/valist/ValistContext';
import parseError from '../../utils/Errors';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { generateID, ReleaseMeta } from '@valist/sdk';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAccountNames, selectAccounts, selectLoginTried, selectLoginType } from '../../features/accounts/accountsSlice';
import { showLogin } from '../../features/modal/modalSlice';
import { dismiss, notify } from '../../utils/Notifications';
import { selectName, selectDescription, selectProject, selectTeam, setProject, setTeam, clear } from '../../features/releases/releaseSlice';
import { getProjectNames } from '../../utils/Apollo/normalization';
import ReleasePreview from '../../features/releases/ReleasePreview';
import PublishReleaseForm from '../../features/releases/PublishReleaseForm';
import { BigNumberish } from 'ethers';
import getConfig from 'next/config';
import { useListState } from '@mantine/hooks';
import { FileList } from '@/components/Files/FileUpload';

const PublishReleasePage: NextPage = () => {
  // Page State
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const valistCtx = useContext(ValistContext);
  const loginType = useAppSelector(selectLoginType);
  const loginTried = useAppSelector(selectLoginTried);
  const accountNames = useAppSelector(selectAccountNames);
  const accounts =   useAppSelector(selectAccounts);
  const dispatch = useAppDispatch();

  // Release State
  const account = useAppSelector(selectTeam);
  const project = useAppSelector(selectProject);
  const name = useAppSelector(selectName);
  const description = useAppSelector(selectDescription);
  
  const [projectID, setProjectID] = useState<BigNumberish | null>(null);
  const [releaseFiles, setReleaseFiles] = useListState<FileList>([]);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [releaseImage, setReleaseImage] = useState<File | null>(null);
  const [isDefaults, setIsDefaults] = useState<boolean>(false);

  let incomingAccount = (router.query.account as string | undefined);
  let incomingProject = (router.query.project as string | undefined);

  // Check if user is authenticated, prompt them to login if not logged in
  useEffect(() => {
    (async () => {
      if (loginType === 'readOnly' && loginTried) {
        dispatch(showLogin());
      }
    })();
  }, [dispatch, loginTried, loginType]);

  // On page load, clear any input from previous pages/sessions
  useEffect(() => {
    dispatch(clear());
  }, [dispatch]);

  // On page load set releaseAccount from url or from first item in list of user accounts
  useEffect(() => {
    if (incomingAccount && accounts && !isDefaults) {
      dispatch(setTeam(incomingAccount || accountNames[0]));
      const projectNames = getProjectNames(accounts, incomingAccount);

      console.log('projectNames', projectNames);
      setAvailableProjects(projectNames);
      dispatch(setProject(incomingProject || projectNames[0] || ''));
      setIsDefaults(true);
    }
  }, [accounts]);
  
  // If the selected releaseAccount changes set the projectNames under that account
  useEffect(() => {
    if (account && accounts && isDefaults) {
      const projectNames = getProjectNames(accounts, account);
      setAvailableProjects(projectNames);
      dispatch(setProject(projectNames[0] || ''));
    }
  }, [account, accountNames]);

  // If projectAccount && projectName, generate account and projectID
  useEffect(() => {
    if (project) {
      const chainID = publicRuntimeConfig.CHAIN_ID;
      const accountID = generateID(chainID, account);
      const projectID = generateID(accountID, project);
      setProjectID(projectID);
    }
  }, [project, publicRuntimeConfig.CHAIN_ID]);

  const createRelease = async () => {
    if (!projectID || !valistCtx) return;
    let imgURL = "";

    if (releaseImage) {
      imgURL = await valistCtx.writeFile(releaseImage);
    }

    const release = new ReleaseMeta();
		release.image = imgURL;
		release.name = name;
		release.description = description;
    
    const uploadToast = notify('text', 'Uploading files...');

    // map the files to a format IPFS can handle
    const files: { path: string, content: File }[] = [];
    
    releaseFiles.map(file => {
      // @ts-ignore
      files.push({ path: file.src.path, content: file.src });
    });

    release.external_url = await valistCtx.writeFolder(files);
    dismiss(uploadToast);
  
    console.log("Release Team", account);
    console.log("Release Project", project);
    console.log("Release Name", name);
    console.log("Meta", release);

    let toastID = '';
    try {
      toastID = notify('pending');
      const transaction = await valistCtx.createRelease(
        projectID,
        name,
        release,
      );

      dismiss(toastID);
      toastID = notify('transaction', transaction.hash);
      await transaction.wait();
      
      dismiss(toastID);
      notify('success');
      router.push('/');
    } catch(err: any) {
      console.log('Error', err);
      dismiss(toastID);
      notify('error', parseError(err));
    }
  };

  return (
    <Layout title={`Valist | Publish Release`}>
      <div className="grid grid-cols-1 gap-4 items-start gap-y-6 lg:grid-cols-12 lg:gap-8">
        {/* Right Column */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 lg:col-span-5">
            <div className="p-4">
              <PublishReleaseForm
                teamNames={accountNames}
                projectID={projectID}
                projectNames={availableProjects}
                releaseTeam={account}
                releaseProject={project}
                releaseName={name}
                releaseFiles={releaseFiles}
                setImage={setReleaseImage}
                setFiles={setReleaseFiles}
                submit={() => {createRelease();}}
              />
            </div>
        </div>

        {/* Right column */}
        <div className="grid grid-cols-1 lg:col-span-7 gap-4">
          <ReleasePreview 
            releaseTeam={account}
            releaseProject={project}
            releaseName={name} 
            releaseImage={releaseImage}
            releaseDescription={description}            
          />
        </div>
      </div>
    </Layout>
  );
};

export default PublishReleasePage;