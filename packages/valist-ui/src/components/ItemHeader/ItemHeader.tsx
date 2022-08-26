import {
  Anchor,
  Group,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';

import type { Icon } from 'tabler-icons-react';
import { Item } from '../Item';
import { Button, ButtonVariant } from '../Button';
import { Fab } from '../Fab';
import useStyles from './ItemHeader.styles';

export interface ItemHeaderAction {
  label: string;
  icon: Icon;
  href: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  hide?: boolean;
  variant?: ButtonVariant;
}

export interface ItemHeaderProps {
  name: string;
  image?: string;
  label?: string;
  leftActions: ItemHeaderAction[];
  rightActions: ItemHeaderAction[];
}

export function ItemHeader(props: ItemHeaderProps) {
  const { classes } = useStyles();

  const rightActions = props.rightActions.filter(action => !action.hide);
  const leftActions = props.leftActions.filter(action => !action.hide);
  const actions = leftActions.concat(rightActions);

  return (
    <Group spacing={24} mb="xl" noWrap>
      <Item
        large={true}
        name={props.name} 
        image={props.image} 
        label={props.label} 
      />
      <Group className={classes.wrapper}>
        <Group>
          { leftActions.map((action, index) =>
            <Tooltip key={index} label={action.label} position="bottom">
              <Anchor target={action.target} href={action.href}>
                <UnstyledButton className={classes.action}>
                  <action.icon size={28} />
                </UnstyledButton>
              </Anchor>
            </Tooltip>
          )}
        </Group>
        <Group>
          { rightActions.map((action, index) =>
            <Anchor key={index} target={action.target} href={action.href}>
              <Button variant={action.variant}>
                {action.label}
              </Button>
            </Anchor>
          )}
        </Group>
      </Group>
      { actions.length > 0 && 
        <Fab>
          { actions.map((action, index) =>
            <Anchor key={index} target={action.target} href={action.href}>
              <Fab.Button label={action.label}>
                <action.icon size={32} />
              </Fab.Button>
            </Anchor>
          )}
        </Fab>
      }
    </Group>
  );
}