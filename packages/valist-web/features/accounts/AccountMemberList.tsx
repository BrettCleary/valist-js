import { Paper } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import AddressIdenticon from '../../components/Identicons/AddressIdenticon';
import Web3Context from '../valist/Web3Context';

interface TeamMemberListItemProps {
  id: string
}

function TeamMemberListItem(props: TeamMemberListItemProps): JSX.Element {
  const web3Ctx = useContext(Web3Context);
  const [ens, setEns] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let value = null;

      if (props.id !== '0x0') {
        try {
          value = await web3Ctx.reverseEns(props.id);
        } catch (err) {}
      }

      setEns(value);
    })();
  }, [props.id, web3Ctx.reverseEns]);

  return (
    <li className="py-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <AddressIdenticon address={props.id} height={32} width={32} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate">
            {ens || props.id}
          </p>
        </div>
      </div>
    </li>
  );
}

type TeamMember = {
  id: string
}

interface TeamMemberListProps {
  accountName: string,
  accountMembers: TeamMember[]
}

export default function TeamMemberList(props: TeamMemberListProps): JSX.Element {
  return (
    <section>
      <Paper shadow="xs" p="md" radius="md" withBorder>
        <div>
          <h2>Members</h2>
          <div className="flow-root mt-6">
            <ul className="-my-5 divide-y divide-gray-200">
              { props.accountMembers.map((member: TeamMember) => <TeamMemberListItem key={member.id} id={member.id} />)}
            </ul>
          </div>
        </div>
      </Paper>
    </section>
  );
}
