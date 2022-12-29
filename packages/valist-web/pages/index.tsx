import { useState } from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import { NextLink } from '@mantine/next';
import { Carousel } from '@mantine/carousel';
import { Layout } from '@/components/Layout';
import { Metadata } from '@/components/Metadata';
import { DiscoveryCard } from '@/components/DiscoveryCard';
import { filterAddresses } from '@/utils/config';
import { featuredApps, featuredGames, featuredTestnet } from '@/utils/discover';
import { client } from '@/components/ApolloProvider';
import query from '@/graphql/Discover.graphql';

import {
  Group,
  SimpleGrid,
  Stack,
  Title,
  Text,
  useMantineTheme,
} from '@mantine/core';

import {
  Button,
  Card,
  DiscoveryFooter,
} from '@valist/ui';

export interface DiscoverProps {
  recent: any[];
  newest: any[];
}

const Discover: NextPage<DiscoverProps> = (props) => {
  const theme = useMantineTheme();
  const [offset, setOffset] = useState(12);

	return (
    <Layout padding={0}>
      <div style={{ padding: 40 }}>
        <div 
          style={{ 
            height: 500,
            borderRadius: 8,
            position: 'relative',
            background: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <Image
            style={{ zIndex: -1, borderRadius: 8 }}
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            alt="Shattered Realms"
            src="/images/discovery/shattered_realms.jpg"
            priority
          />
          <Stack align="center" justify="center" style={{ height: 500 }}>
            <Title color="white" size={96}>Shattered Realms</Title>
            <Text color="white" size={24}>Action, Adventure, RPG</Text>
            <NextLink href="/shatteredrealms/game">
              <Button>View Game</Button>
            </NextLink>
          </Stack>
        </div>
        <div style={{ paddingTop: 44 }}>
          <Stack>
            <Title size={32}>Featured Games</Title>
            <Carousel
              height={340}
              slideGap={32}
              slideSize={280}
              align="start"
              dragFree
              loop
            >
              {featuredGames.map((item: any, index: number) => 
                <Carousel.Slide key={index}>
                  <DiscoveryCard {...item} />
                </Carousel.Slide>,
              )}
            </Carousel>
          </Stack>
          <Stack pt={100}>
            <Title size={32}>Featured dApps</Title>
            <Carousel
              height={340}
              slideGap={32}
              slideSize={280}
              align="start"
              dragFree
              loop
            >
              {featuredApps.map((item: any, index: number) => 
                <Carousel.Slide key={index}>
                  <DiscoveryCard {...item} />
                </Carousel.Slide>,
              )}
            </Carousel>
          </Stack>
          <Stack pt={100}>
            <Title size={32}>Featured on Testnet</Title>
            <Carousel
              height={340}
              slideGap={32}
              slideSize={280}
              align="start"
              dragFree
              loop
            >
              {featuredTestnet.map((item: any, index: number) => 
                <Carousel.Slide key={index}>
                  <DiscoveryCard {...item} />
                </Carousel.Slide>,
              )}
            </Carousel>
          </Stack>
          <Stack pt={100}>
            <Title size={32}>Recently Updated</Title>
            <SimpleGrid
              breakpoints={[
                { minWidth: 'sm', cols: 1, spacing: 32 },
                { minWidth: 'md', cols: 2, spacing: 32 },
                { minWidth: 'lg', cols: 3, spacing: 32 },
                { minWidth: 'xl', cols: 4, spacing: 32 },
              ]}
            >
              {props.recent.slice(0, 8).map((project: any, index: number) =>
                <Metadata key={index} url={project.metaURI}>
                  {(data: any) => (
                    <DiscoveryCard link={`/${project.account.name}/${project?.name}`} {...data} /> 
                  )}
                </Metadata>,
              )}
            </SimpleGrid>
          </Stack>
          <Stack pt={100}>
            <Title size={32}>Newest Apps and Games</Title>
            <SimpleGrid
              breakpoints={[
                { minWidth: 'sm', cols: 1, spacing: 32 },
                { minWidth: 'md', cols: 2, spacing: 32 },
                { minWidth: 'lg', cols: 3, spacing: 32 },
                { minWidth: 'xl', cols: 4, spacing: 32 },
              ]}
            >
              {props.newest.slice(0, offset).map((project: any, index: number) =>
                <Metadata key={index} url={project.metaURI}>
                  {(data: any) => (
                    <DiscoveryCard link={`/${project.account.name}/${project?.name}`} {...data} /> 
                  )}
                </Metadata>,
              )}
            </SimpleGrid>
            <Group position="center" mt={32}>
              <Button onClick={() => setOffset(offset + 12)}>
                Load More
              </Button>
            </Group>
          </Stack>
        </div>
      </div>
      <div style={{ height: 584, position: 'relative' }}>
        <Image
          style={{ zIndex: -1 }}
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          alt="Shattered Realms"
          src={`/images/discovery/publish_promo_${theme.colorScheme}.jpg`}
          priority
        />
        <Stack spacing={0} align="start" justify="center" p={64} style={{ height: '100%' }}>
          <Title color="white" size={56}>Publish Today</Title>
          <Text color="white" size={24} mt={24}>Have your software, webapp, or game</Text>
          <Text color="white" size={24} mb={40}>hosted on Valist to be truly decentralized!</Text>
          <NextLink href="/-/dashboard">
            <Button style={{ background: 'linear-gradient(90deg, #FF9A9E 0%, #FAD0C4 99%, #FAD0C4 100%)' }}>
              Publish Now
            </Button>
          </NextLink>
        </Stack>
      </div>
      <DiscoveryFooter />
    </Layout>
	);
};

export default Discover;

export async function getStaticProps() {
  const variables = { order: 'desc', filterAddresses };
  const { data } = await client.query({ query, variables });

  const projectMap = new Map<string, any>();
  const releases = data?.releases ?? [];

  releases.map((r: any) => r.project)
    .forEach((p: any) => projectMap.set(p.id, p));

  const recent = Array.from(projectMap.values());
  const newest = recent.slice()
    .sort((a: any, b: any) => b.blockTime.localeCompare(a.blockTime));

  return {
    props: { recent, newest },
    revalidate: 1 * 60 * 60,
  };
}