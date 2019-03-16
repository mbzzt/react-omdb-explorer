import React, { Component } from 'react';
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
      movies: {
        ...movies,
        [imdbID]: result
      }
    });

    console.log(movies[imdbID]);
  };

  needsToSearchMovie = imdbID => {
    const { movies } = this.state;
    return !(movies && movies[imdbID]);
  };

  fetchSearchTopStories = (searchTerm, page = 1) => {
    fetch(
      `${PATH_BASE}?${PARAM_API_KEY}${API_KEY}&${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`
    )
      .then(response => response.json())
      .then(result => this.setSearchTopStories({ movies: result.Search, page }))
      .catch(e => this.setState({ error: e }));
  };

  needsToSearchTopStories = searchTerm => {
    const { results } = this.state;
    return !results[searchTerm];
  };

  fetchMovie = imdbID => {
    return fetch(`${PATH_BASE}?${PARAM_API_KEY}${API_KEY}&${PARAM_ID}${imdbID}`)
      .then(response => response.json())
      .then(result => this.setSearchMovie(result))
      .catch(e => this.setState({ error: e }));
  };

  onGetMovieInfo = imdbID => {
    console.log(`get movie info for: ${imdbID}`);
    const { movies } = this.state;
    if (this.needsToSearchMovie(imdbID)) {
      this.fetchMovie(imdbID).then(() =>
        this.setState({
          activeMovie: movies[imdbID]
        })
      );
    } else {
      console.log(movies[imdbID]);
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

const Search = ({ value, onChange, onSubmit, children }) => (
  <form onSubmit={onSubmit}>
    <input type="text" value={value} onChange={onChange} />
    <button type="submit">{children}</button>
  </form>
);

const Table = ({ list, onDismiss, onGetMovieInfo, onResetActiveMovie, activeMovie }) => (
  <div className="table" id="close">
    {list.map(item => (
      <div key={item.imdbID} className="table-row">
        <span style={{ width: '40%' }}>
          <a href={item.url}>{item.Title}</a>
        </span>
        <span style={{ width: '20%' }}>{item.Year}</span>
        <span style={{ width: '20%' }}>{item.Type}</span>
        <span style={{ width: '20%' }}>
          <Button onClick={() => onDismiss(item.imdbID)} className="button-inline">
            Dismiss
          </Button>
          <Button onClick={() => onGetMovieInfo(item.imdbID)} className="button-inline">
            Info
          </Button>
        </span>
        {
          // activeMovie && activeMovie.imdbID === item.imdbID &&
          // <span></span>
        }
      </div>
    ))}
    {activeMovie && (
      <div className={`modal ${activeMovie ? 'active' : ''}`} id="modal-movie">
        <button
          type="button"
          className="modal-overlay"
          aria-label="Close"
          onClick={onResetActiveMovie}
        >
          <span className="text-assistive">Close</span>
        </button>
        <div className="modal-container">
          <div className="modal-header">
            <button
              type="button"
              className="btn btn-clear float-right"
              aria-label="Close"
              onClick={onResetActiveMovie}
            >
              <span className="text-assistive">Close</span>
            </button>
            <div className="modal-title h5">Modal title</div>
          </div>
          <div className="modal-body">
            <div className="content">
              <ul>
                {Object.keys(activeMovie).map(k =>
                  k !== 'Poster' ? (
                    <li key={k.toLowerCase()}>{`${k}: ${activeMovie[k]}`}</li>
                  ) : (
                    <li key={k.toLowerCase()}>
                      {`${k}: `}
                      <br />
                      <img src={activeMovie[k]} alt={activeMovie.Title} />
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onResetActiveMovie}>
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

const Button = ({ onClick, className = '', children }) => (
  <button onClick={onClick} className={className} type="button">
    {children}
  </button>
);

export default App;
