import React from 'react';

import { Route, Redirect } from "react-router-dom";

// components
import Unauthorized from 'shared-components/logout/Unauthorized';

// state 
import { connect } from 'react-redux';

// utils
import { userTypeHasAccess } from 'utils/accessControl';

const AuthGuard = ({ component: Component, authed, type, ld, ...rest }) => {

  const { isUser, userRole } = ld.login;

  const hasAccess = userTypeHasAccess(rest.computedMatch.path);

  if (authed === undefined || authed === null) {
    authed = isUser;
  }

  if (type === undefined || type === null) {
    type = userRole;
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        if (authed === true) {
          return hasAccess ? <Component {...props} /> : <Unauthorized />
        }
        else {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        }
      }}
    />
  );
}

// export default Login
const mapStateToProps = (state) => ({
  ld: state.loginDetails,
  ad: state.appDetails
});

export default connect(mapStateToProps)(AuthGuard);
