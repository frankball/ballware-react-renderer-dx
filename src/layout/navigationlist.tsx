import React, { useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { NavigationLayoutItem } from '@ballware/meta-interface';
import { TenantContext } from '@ballware/react-contexts';

const useStyles = makeStyles((theme) => ({
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

const ListItemLink = (props: any) => {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo<any>(
    () =>
      React.forwardRef((itemProps, ref: any) => (
        <Link ref={ref} to={to} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink} className={className}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
};

export const NavigationList = () => {
  const classes = useStyles();
  const { pageAllowed, navigation } = useContext(TenantContext);

  const renderItems = useCallback(
    (items: Array<NavigationLayoutItem>) => {
      let itemKey = 1;

      return items?.map((item) => {
        switch (item.type) {
          case 'group': {
            const children = item.items ? renderItems(item.items) : [];

            if (children && children.length > 0) {
              return (
                <Group key={itemKey++} caption={item.options.caption ?? ''}>
                  {children}
                </Group>
              );
            }

            return <React.Fragment key={itemKey++} />;
          }
          case 'section': {
            const children = item.items ? renderItems(item.items) : [];

            if (children?.length > 0) {
              return (
                <React.Fragment key={itemKey++}>
                  <Divider />
                  {children}
                </React.Fragment>
              );
            }

            return <React.Fragment key={itemKey++} />;
          }
          case 'page': {
            let pageVisible = true;

            try {
              pageVisible =
                pageAllowed && item.options.page
                  ? pageAllowed(item.options.page)
                  : false;
            } catch (exception) {
              console.error(
                'Exception in user code: Tenant custom script pageVisible ' +
                  exception
              );
              pageVisible = false;
            }

            if (pageVisible) {
              return (
                <ListItemLink
                  key={itemKey++}
                  className={classes.nested}
                  to={`/${item.options.url}`}
                  primary={item.options.caption}
                />
              );
            } else {
              return <React.Fragment key={itemKey++} />;
            }
          }
          default:
            return <React.Fragment key={itemKey++} />;
        }
      });
    },
    [pageAllowed, classes.nested]
  );

  const Group = ({
    caption,
    children,
  }: {
    caption: string;
    children: Array<JSX.Element>;
  }) => {
    const [open, setOpen] = React.useState(false);

    return (
      <React.Fragment>
        <ListItem button onClick={() => setOpen(!open)}>
          <ListItemText primary={caption} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  return (
    <List>{navigation && pageAllowed && renderItems(navigation?.items)}</List>
  );
};
