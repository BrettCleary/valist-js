import React, { ReactNode, useState } from 'react';
import Head from 'next/head';
import { AppShell, useMantineTheme } from '@mantine/core';
import Navbar from './Navbar';
import Header from './Header';

interface LayoutProps {
  children?: ReactNode,
  title?: string,
};

export default function Layout(props: LayoutProps): JSX.Element {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  const backgroundColor = theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[1];

  return (
    <React.Fragment>
      <Head>
        <title>{props.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppShell
        fixed
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        padding="md"
        navbar={<Navbar opened={opened} />}
        header={<Header opened={opened} onBurger={() => setOpened(!opened)} />}
        styles={(theme) => ({ main: { backgroundColor } })}
      >
        { props.children }
      </AppShell>
    </React.Fragment>
  );
};