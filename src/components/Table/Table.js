import React from 'react';
import Button from '../Button/Button';

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

export default Table;
