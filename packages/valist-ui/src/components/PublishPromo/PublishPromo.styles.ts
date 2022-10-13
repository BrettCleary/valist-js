import { createStyles } from '@mantine/styles';
import { useMediaQuery } from '@mantine/hooks';
import { useMantineTheme } from "@mantine/core";

export default createStyles(() => {
  const isMobile = useMediaQuery('(max-width: 900px)');
  const theme = useMantineTheme();
  const bgImg = theme.colorScheme === 'dark' ? `url('/images/discovery/publish_bg.png')` : '';
  const bgColor = theme.colorScheme === 'dark' ? '' : '#5850EC';
  const btnColor = theme.colorScheme === 'dark' ? '#5850EC' : 'linear-gradient(90deg, #FF9A9E 0%, #FAD0C4 99%, #FAD0C4 100%), #5850EC';
  const paddingY = isMobile ? '24px' : '64px';

  return {
    "root": {
      padding: `0 ${paddingY} 0 ${paddingY}`,
      background: bgColor,
      maxWidth: '100vw',
      backgroundImage: bgImg,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    },
    "heading": {
      fontSize: isMobile ? 40 : 56,
      color: 'white',
      fontWeight: 900,
      margin: 0,
    },
    "text": {
      fontSize: 21,
      color: 'white',
      margin: '10px 0 25px 0',
    },
    "button": {
      background: btnColor,
    },
    "msgBox": {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    }
  };
});
