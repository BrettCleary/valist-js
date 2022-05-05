/* eslint-disable @next/next/no-img-element */
import React, { useContext, useEffect, useState } from 'react';
import { notify } from '../../utils/Notifications';
import AddressIdenticon from '../../components/Identicons/AddressIdenticon';
import { AccountMeta } from '@valist/sdk';

type TeamListCardProps = {
  text?: string;
  image?: string;
  teamName: string;
  metaURI: string;
};

export default function TeamListCard({ text, image, teamName, metaURI }: TeamListCardProps): JSX.Element {
  let [ meta, setMeta ] = useState<AccountMeta>({
    image: '',
  });

  useEffect(() => {
    const fetchTeamMeta = async (metaURI: string) => {
      if (metaURI !== '' || metaURI !== undefined) {
        try {
          const teamJson = await fetch(metaURI).then(res => res.json());
          setMeta(teamJson);
        } catch (err) {
          console.log("Failed to fetch team metadata.", err);
          console.log(metaURI);
          notify('error', String(err));
        }
      }
    };

    if (!text) {
      fetchTeamMeta(metaURI);
    }
  }, [metaURI, text]);

  return (
    <div style={{ height: '116px' }} className="bg-white rounded-lg shadow px-6 py-6 mb-2 border-2 hover:border-indigo-500 cursor-pointer">
      <div className='flex mb-3'>
        <div className="flex-shrink-0 mr-5">
          {(image || meta.image) ?
            <div className="flex-shrink-0 mx-auto rounded-full overflow-hidden" style={{ height: 50, width: 50 }} >
              <img className='rounded-full' src={image || meta.image} alt="Profile Pic" /> 
            </div>
            :
            <AddressIdenticon address={teamName} height={50} width={50} />
          }
        </div>

        <div>
          <h3 className="text-xl">
            {teamName}
          </h3>
          <p style={{ overflow: 'hidden' }}>
            {text || meta.description}
          </p>
        </div>
      </div>
    </div>
  );
};