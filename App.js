import React from 'react';
import { Platform } from 'react-native';
import {
  createAppContainer,
  createStackNavigator,
  createBottomTabNavigator,
  createSwitchNavigator
} from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';

import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons
} from '@expo/vector-icons';

import MovieListScreen from './app/screens/MovieListScreen';
import ConfigurationScreen from './app/screens/ConfigurationScreen';
import MovieDetailsScreen from './app/screens/MovieDetailsScreen';
import SearchScreen from './app/screens/SearchScreen';
import SearchResultsScreen from './app/screens/SearchResultsScreen';
import WebViewScreen from './app/screens/WebViewScreen';

import LoginScreen from './app/screens/LoginScreen';
import ClubListScreen from './app/screens/ClubListScreen';
import ClubThreadScreen from './app/screens/ClubThreadScreen';
import JoinClubScreen from './app/screens/JoinClubScreen';
import RecommendationsScreen from './app/screens/RecommendationsScreen';
import BrowseMoviesForClubScreen from './app/screens/BrowseMoviesForClubScreen';
import AddMovieForClubScreen from './app/screens/AddMovieForClubScreen';
import CreateClubScreen from './app/screens/CreateClubScreen';

const TitleMovieTab = 'Home';
const TitleConfigTab = 'More';
const TitleSearchTab = 'Search';
const TitleRecommendationsTab = 'For You';
const TitleWebView = 'Trailer';
const TitleClubListTab = 'Clubs';

const Login = createStackNavigator({
  Login: {
    screen: LoginScreen
  }
});

const ClubListTab = createStackNavigator(
  {
    AddMovieForClub: {
      screen: AddMovieForClubScreen,
      navigationOptions: {
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    },
    BrowseMoviesForClub: {
      screen: BrowseMoviesForClubScreen,
      navigationOptions: {
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    },
    Clubs: {
      screen: ClubListScreen,
      navigationOptions: {
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    },
    ClubThread: {
      screen: ClubThreadScreen,
      navigationOptions: {
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    },
    CreateClub: {
      screen: CreateClubScreen,
      navigationOptions: {
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    },
    JoinClub: {
      screen: JoinClubScreen,
      navigationOptions: {
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    }
  },
  {
    initialRouteName: 'Clubs'
  }
);

ClubListTab.navigationOptions = {
  tabBarIcon: ({ tintColor }) => (
    <MaterialIcons name="group" size={20} color={tintColor} />
  )
};

const RecommendationsTab = createStackNavigator({
  Recommendations: {
    screen: RecommendationsScreen,
    navigationOptions: {
      headerTintColor: '#47525E',
      headerStyle: {
        backgroundColor: '#ffffff'
      }
    }
  },
  MovieDetails: {
    screen: MovieDetailsScreen,
    navigationOptions: {
      headerTintColor: '#47525E',
      headerStyle: {
        backgroundColor: '#ffffff'
      }
    }
  }
});

RecommendationsTab.navigationOptions = {
  tabBarIcon: ({ tintColor }) => (
    <MaterialCommunityIcons
      name="lightbulb-on-outline"
      size={20}
      color={tintColor}
    />
  )
};

const MoviesTab = createStackNavigator(
  {
    MovieList: {
      screen: MovieListScreen,
      navigationOptions: {
        title: TitleMovieTab,
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    },
    MovieDetails: {
      screen: MovieDetailsScreen,
      navigationOptions: {
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    },
    WebView: {
      screen: WebViewScreen,
      navigationOptions: {
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        },
        title: TitleWebView
      }
    }
  },
  {
    initialRouteName: 'MovieList'
  }
);

MoviesTab.navigationOptions = {
  tabBarIcon: ({ tintColor }) => (
    <Feather name="home" size={20} color={tintColor} />
  )
};

const SearchTab = createStackNavigator(
  {
    Search: {
      screen: SearchScreen,
      navigationOptions: {
        title: TitleSearchTab,
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    },
    SearchResults: {
      screen: SearchResultsScreen,
      navigationOptions: {
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    },
    MovieDetails: {
      screen: MovieDetailsScreen,
      navigationOptions: {
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    },
    WebView: {
      screen: WebViewScreen,
      navigationOptions: {
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        },
        title: TitleWebView
      }
    }
  },
  {
    initialRouteName: 'Search'
  }
);

SearchTab.navigationOptions = {
  tabBarIcon: ({ tintColor }) => (
    <Feather name="search" size={20} color={tintColor} />
  )
};

const ConfigurationTab = createStackNavigator(
  {
    Configuration: {
      screen: ConfigurationScreen,
      navigationOptions: {
        title: TitleConfigTab,
        headerTintColor: '#47525E',
        headerStyle: {
          backgroundColor: '#ffffff'
        }
      }
    }
  },
  {
    initialRouteName: 'Configuration'
  }
);

ConfigurationTab.navigationOptions = {
  tabBarIcon: ({ tintColor }) => (
    <Feather name="menu" size={20} color={tintColor} />
  )
};

const MovieListTabBarVisible = navigation => {
  const { routes } = navigation.state;
  if (routes && routes.length > 0) {
    const route = routes[routes.length - 1];
    if (
      route.routeName === 'MovieDetails' ||
      route.routeName === 'WebView' ||
      route.routeName === 'SearchResults'
    ) {
      return false;
    }
  }
  return true;
};

const bottomTabs = {
  Movie: {
    screen: MoviesTab,
    navigationOptions: ({ navigation }) => ({
      title: TitleMovieTab,
      tabBarVisible: MovieListTabBarVisible(navigation)
    })
  },
  Search: {
    screen: SearchTab,
    navigationOptions: ({ navigation }) => ({
      title: TitleSearchTab,
      tabBarVisible: MovieListTabBarVisible(navigation)
    })
  },
  Recommendations: {
    screen: RecommendationsTab,
    navigationOptions: ({ navigation }) => ({
      title: TitleRecommendationsTab,
      tabBarVisible: MovieListTabBarVisible(navigation)
    })
  },
  Clubs: {
    screen: ClubListTab,
    navigationOptions: ({ navigation }) => ({
      title: TitleClubListTab,
      tabBarVisible: MovieListTabBarVisible(navigation)
    })
  },
  Config: {
    screen: ConfigurationTab,
    navigationOptions: {
      title: TitleConfigTab
    }
  }
};

const MainNavigator =
  Platform.OS === 'ios'
    ? createBottomTabNavigator(bottomTabs, {
        tabBarOptions: {
          activeTintColor: '#F95F62',
          inactiveTintColor: '#8190A5',
          showIcon: true,
          labelStyle: {
            margin: 0,
            padding: 2
          },
          style: {
            backgroundColor: '#ffffff'
          }
        },
        animationEnabled: false,
        swipeEnabled: false
      })
    : createMaterialBottomTabNavigator(bottomTabs, {
        initialRouteName: 'Movie',
        activeTintColor: '#F95F62',
        inactiveTintColor: '#8190A5',
        shifting: true,
        barStyle: {
          backgroundColor: '#ffffff',
          paddingTop: 2,
          paddingBottom: 2
        }
      });

const AppNavigator = createSwitchNavigator(
  {
    Login,
    Main: MainNavigator
  },
  {
    initialRouteName: 'Login'
  }
);

export default createAppContainer(AppNavigator);
