

function SearchBar({ searchQuery, setSearchQuery, handleSearch }) {

    return (
        <form className="navbar-search" onSubmit={handleSearch}>
            <input
                type="text"
                placeholder="Hae elokuvia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Hae</button>
        </form>
    );
}

export default SearchBar;