

function SearchBar({ searchQuery, setSearchQuery, handleSearch, resetSearch }) {

    return (
        <form className="navbar-search" onSubmit={handleSearch}>
            <input
                type="text"
                placeholder="Hae elokuvia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Hae</button>
            <button onClick={resetSearch}>Etusivulle</button>
        </form>
    );
}

export default SearchBar;