import React, { Component } from 'react';
import Button from '../Button/Button';
import Search from '../Search/Search';
import Table from '../Table/Table';
import './App.css';

const DEFAULT_QUERY = 'fight';
// const DEFAULT_HPP = '100';

// const PATH_BASE = 'https://hn.algolia.com/api/v1';
// const PATH_SEARCH = '/search';
// const PARAM_SEARCH = 'query=';
// const PARAM_PAGE = 'page=';
// const PARAM_HPP = 'hitsPerPage=';

const API_KEY = process.env.REACT_APP_OMDB_API_KEY; // your free api key from omdbapi.com, set in .env file
const PATH_BASE = 'http://www.omdbapi.com/';
const PARAM_API_KEY = 'apikey=';
const PARAM_SEARCH = 's=';
const PARAM_PAGE = 'page=';
const PARAM_ID = 'i=';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: null,
      movies: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      activeMovie: null
    };
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  fetchSearchTopStories = (searchTerm, page = 1) => {
    fetch(
      `${PATH_BASE}?${PARAM_API_KEY}${API_KEY}&${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw Error(response.statusText);
      })
      .then(result => this.setSearchTopStories({ movies: result.Search, page }))
      .catch(e => this.setState({ error: e }));
  };

  setSearchTopStories = result => {
    const { movies, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey] ? results[searchKey].movies : [];

    const updatedHits = [...oldHits, ...movies];

    this.setState({
      results: {
        ...results,
        [searchKey]: { movies: updatedHits, page }
      }
    });
  };

  setSearchMovie = result => {
    const { movies } = this.state;
    const { imdbID } = result;

    this.setState({
      activeMovie: { ...result },
      movies: {
        ...movies,
        [imdbID]: { ...result }
      }
    });
  };

  needsToSearchMovie = imdbID => {
    const { movies } = this.state;
    return !(movies && movies[imdbID]);
  };

  needsToSearchTopStories = searchTerm => {
    const { results } = this.state;
    return !results[searchTerm];
  };

  fetchMovie = imdbID => {
    return fetch(`${PATH_BASE}?${PARAM_API_KEY}${API_KEY}&${PARAM_ID}${imdbID}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw Error(response.statusText);
      })
      .then(result => this.setSearchMovie(result))
      .catch(e => this.setState({ error: e }));
  };

  onGetMovieInfo = imdbID => {
    const { movies } = this.state;
    if (this.needsToSearchMovie(imdbID)) {
      this.fetchMovie(imdbID);
    } else {
      this.setState({
        activeMovie: movies[imdbID]
      });
    }
  };

  onResetActiveMovie = event => {
    event.preventDefault();
    this.setState({
      activeMovie: null
    });
  };

  onDismiss = id => {
    const { searchKey, results } = this.state;
    const { movies, page } = results[searchKey];

    const isNotId = item => item.imdbID !== id;
    const updatedHits = movies.filter(isNotId);

    this.setState({
      results: {
        ...results,
        [searchKey]: { movies: updatedHits, page }
      }
    });
  };

  onSearchChange = event => {
    this.setState({
      searchTerm: event.target.value
    });
  };

  onSearchSubmit = event => {
    const { searchTerm } = this.state;
    this.setState({
      error: null,
      searchKey: searchTerm
    });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  };

  render() {
    const { searchTerm, results, searchKey, error, activeMovie } = this.state;

    const page = (results && results[searchKey] && results[searchKey].page) || 1;

    const list = (results && results[searchKey] && results[searchKey].movies) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        {error ? (
          <div className="interactions">
            <p>Something went wrong.</p>
          </div>
        ) : (
          <Table
            list={list}
            onDismiss={this.onDismiss}
            onGetMovieInfo={this.onGetMovieInfo}
            onResetActiveMovie={this.onResetActiveMovie}
            activeMovie={activeMovie}
          />
        )}
        <div className="interactions">
          <Button onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>More</Button>
        </div>
      </div>
    );
  }
}

export default App;
