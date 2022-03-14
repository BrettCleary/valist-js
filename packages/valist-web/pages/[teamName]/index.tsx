import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from "@apollo/client";
import Layout from '../../components/Layouts/Main';
import TeamProfileCard from '../../components/Teams/TeamProfileCard';
import TeamMemberList from '../../components/Teams/TeamMemberList';
import TeamProjectList from '../../components/Teams/TeamProjectList';
import { TEAM_PROFILE_QUERY } from '../../utils/Apollo/queries';
import { Project } from '../../utils/Apollo/types';
import { TeamMeta } from '../../utils/Valist/types';
import LogCard from '../../components/Logs/LogCard';
import LogTable from '../../components/Logs/LogTable';

type TeamMember = {
  id: string
}

export default function TeamProfilePage() {
  const router = useRouter();
  const teamName = `${router.query.teamName}`;
  const { data, loading, error } = useQuery(TEAM_PROFILE_QUERY, {
    variables: { team: teamName },
    pollInterval: 5000,
  });
  const [view, setView] = useState<string>('Projects');
  const [meta, setMeta] = useState<TeamMeta>({
    image: '',
  });
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const tabs = [
    {
      text: 'Projects',
      disabled: false,
    },
    {
      text: 'Activity',
      disabled: false,
    },
  ];

  useEffect(() => {
    const fetchMeta = async (metaURI: string) => {
      try {
        const teamMeta = await fetch(metaURI).then(res => res.json());
        setMeta(teamMeta);
      } catch(err) { /* TODO HANDLE */ }
    };

    if (data && data.teams && data.teams[0] && data.teams[0].metaURI) {
      fetchMeta(data.teams[0].metaURI);
      setProjects(data.teams[0].projects);
      setMembers(data.teams[0].members);
    }
  }, [data, loading, error, setMeta]);

  return (
    <Layout title='Valist | Team'>
      <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-6 lg:gap-8">
        <div className="grid grid-cols-1 gap-4 lg:col-span-4">
          <TeamProfileCard
            view={view}
            setView={setView}
            teamName={teamName}
            teamImage={meta.image ? meta.image : ''}
            meta={meta}
            tabs={tabs}          
          />
          {view === 'Projects' && <TeamProjectList projects={projects} linksDisbaled={false} />}
          {view === 'Activity' && <LogTable team={teamName} project={''} address={''} />}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:col-span-2">
          <TeamMemberList 
            teamMembers={members} 
            teamName={teamName}          
          />
          <LogCard team={teamName} />
        </div>
      </div> 
    </Layout>
  );
}
