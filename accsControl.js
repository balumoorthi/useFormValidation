import appStore from 'store/index';

import { isArray, isString } from 'lodash';

import { userModuleRoutes, userPageAccess } from 'assets/pageAccess';

export const userTypeHasAccess = (routeURL) => {

  let url, hasAccess, userPageAccessList, userTypeList, routes = [];

  const { user_type, role } = appStore.getState().loginDetails.login;

  if (isString(routeURL) && routeURL !== '/') {
    url = routeURL.replace(/^\/|\/$/g, '');
  } else {
    url = routeURL;
  }

  userTypeList = userPageAccess.filter((item) => {
    return item.userType === user_type;
  })

  if (userTypeList && isArray(userTypeList) && userTypeList[0]) {

    if (user_type === 'U') {

      userPageAccessList = userTypeList[0].route.filter((item) => {
        return item.userRole === role
      })

      const { includeRoutes, excludeRoutes } = userPageAccessList[0];

      routes = userModuleRoutes.filter(item => !excludeRoutes.includes(item));

      routes = routes.concat(includeRoutes);

    } else {
      routes = userTypeList[0].route
    }

  }

  if (routes && isArray(routes)) {
    hasAccess = routes.includes(url);
  } else {
    hasAccess = false;
  }

  return hasAccess;

}
