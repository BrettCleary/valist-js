import React from 'react';
import IndexLayout from '../components/Layout/IndexLayout'
import ProjectList from '../components/ProjectsList/ProjectsList'
import ActivityFeed from '../components/ActivityFeed/ActivityFeed';
import ProfileSidebar from '../components/ProfileSidebar/ProfileSidebar';

/*
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

function listItems() {
  const orgs = [{
    name: "Akashic Technologies",
    description: "Bringing the right people together to build the right things."
  }, {
    name: "Open Source Inc",
    description: "Example organization description"
  }]
  const listItems = orgs.map((org) =>
    <div className="list" key={org.name}>
      <div className="list-item">
          <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {org.name}
                    </Typography>
                    <Typography variant="body2" component="p">
                      {org.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View Organization</Button>
                  </CardActions>
            </Card>
      </div>
    </div>
  );

  return listItems
}
*/

export const IndexPage = ({valist}: {valist: any}) => {
  return (
    <IndexLayout title="valist.io">
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
        <div className="flex-1 min-w-0 bg-white xl:flex">
          <ProfileSidebar />
          <ProjectList valist={valist} />
          <ActivityFeed valist={valist} />
        </div>
      </div>
    </IndexLayout>
  );
}

export default IndexPage
