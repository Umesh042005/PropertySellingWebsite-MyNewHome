import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./navbar.css";
import Login from "./Login";
import CategoryBar from "./CategoryBar";

export default function Navbar({ children }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const picture = localStorage.getItem("picture");

    if (token && email) {
      setUser({ token, email, picture });
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/properties?search=${encodeURIComponent(search)}`);
    } else {
      navigate(`/properties`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("picture");
    setUser(null);
    navigate("/");
  };

  const handleSetUser = (token, email, picture) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    if (picture) {
      localStorage.setItem("picture", picture);
    }
    const savedPicture = picture || localStorage.getItem("picture");
    setUser({ token, email, picture: savedPicture });
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  return (
    <>
      <div className="navbar-wrapper">
        <nav className="nav-shell shadow-sm">
          {/* Brand */}
          <a className="brand-cluster" href="/" aria-label="Go to homepage">
            <img
              src="/logo.png"
              alt="MyNewHome logo"
              className="brand-logo"
              loading="lazy"
            />
            <span>
              <p className="brand-title">MyNewHome</p>
              <p className="brand-tagline">Find • Rent • Sell</p>
            </span>
          </a>

          {/* Search Bar */}
          <form className="nav-search" onSubmit={handleSearch}>
            <span className="search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              className="search-input"
              type="search"
              placeholder="Search projects, localities or builders"
              aria-label="Search properties"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary search-btn" type="submit">
              Search
            </button>
          </form>

          {/* Right Side */}
          <div className="nav-actions">
            <button
              className={`ghost-btn ${showCategories ? "ghost-btn-active" : ""}`}
              onClick={() => setShowCategories(!showCategories)}
            >
              Categories
            </button>

            {user ? (
              <div className={`dropdown ${isDropdownOpen ? "show" : ""}`}>
                <div
                  className="avatar dropdown-toggle"
                  id="userDropdown"
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                  title={user.email}
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt="profile"
                      className="avatar-image"
                    />
                  ) : (
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      alt="default profile"
                      className="avatar-image"
                    />
                  )}
                </div>

                <ul
                  className={`dropdown-menu dropdown-menu-end ${isDropdownOpen ? "show" : ""
                    }`}
                  aria-labelledby="userDropdown"
                >
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/my-ads");
                        toggleDropdown();
                      }}
                    >
                      My Ads
                    </button>
                  </li>

                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/profile");
                        toggleDropdown();
                      }}
                    >
                      Profile
                    </button>
                  </li>

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => {
                        handleLogout();
                        toggleDropdown();
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <button className="ghost-btn" onClick={() => setShowLogin(true)}>
                Login
              </button>
            )}

            {/* Sell Property */}
            <button
              className="cta-btn"
              onClick={() => {
                if (user) navigate("/property/add");
                else setShowLogin(true);
              }}
            >
              + Sell Property
            </button>
          </div>
        </nav>

        {showCategories && <CategoryBar />}
      </div>

      <div className={`page-content ${showCategories ? "with-category" : ""}`}>
        {children}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogin(false);
            }
          }}
        >
          <Login
            closeModal={() => setShowLogin(false)}
            setToken={handleSetUser}
          />
        </div>
      )}
    </>
  );
}