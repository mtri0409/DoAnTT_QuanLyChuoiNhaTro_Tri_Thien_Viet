import React from 'react';
import { Link } from 'react-router-dom';
// Import các icon cần thiết
import { 
  FaBars, 
  FaSearch, 
  FaTimes, 
  FaComments, 
  FaBell, 
  FaEnvelope, 
  FaExpandArrowsAlt, 
  FaThLarge, 
  FaStar 
} from "react-icons/fa"
// import { BiTimeFive } from 'react-icons/bi'; // Icon đồng hồ cho thời gian tin nhắn

const NavBar = () => {
  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" data-widget="pushmenu" href="#" role="button">
            <FaBars />
          </a>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <Link to="/admin" className="nav-link">Home</Link>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <Link to="/contact" className="nav-link">Contact</Link>
        </li>
      </ul>

      {/* Right navbar links */}
      <ul className="navbar-nav ml-auto">
        {/* Navbar Search */}
        <li className="nav-item">
          <a className="nav-link" data-widget="navbar-search" href="#" role="button">
            <FaSearch />
          </a>
          <div className="navbar-search-block">
            <form className="form-inline">
              <div className="input-group input-group-sm">
                <input 
                  className="form-control form-control-navbar" 
                  type="search" 
                  placeholder="Search" 
                  aria-label="Search" 
                />
                <div className="input-group-append">
                  <button className="btn btn-navbar" type="submit">
                    <FaSearch />
                  </button>
                  <button className="btn btn-navbar" type="button" data-widget="navbar-search">
                    <FaTimes />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </li>

        {/* Messages Dropdown Menu */}
        <li className="nav-item dropdown">
          <a className="nav-link" data-toggle="dropdown" href="#">
            <FaComments />
            <span className="badge badge-danger navbar-badge">3</span>
          </a>
          <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
            <a href="#" className="dropdown-item">
              <div className="media">
                <img src="/dist/img/user1-128x128.jpg" alt="User Avatar" className="img-size-50 mr-3 img-circle" />
                <div className="media-body">
                  <h3 className="dropdown-item-title">
                    Brad Diesel
                    <span className="float-right text-sm text-danger"><FaStar /></span>
                  </h3>
                  <p className="text-sm">Call me whenever you can...</p>
                  {/* <p className="text-sm text-muted"><BiTimeFive className="mr-1" /> 4 Hours Ago</p> */}
                </div>
              </div>
            </a>
            <div className="dropdown-divider"></div>
            <a href="#" className="dropdown-item dropdown-footer">See All Messages</a>
          </div>
        </li>

        {/* Notifications Dropdown Menu */}
        <li className="nav-item dropdown">
          <a className="nav-link" data-toggle="dropdown" href="#">
            <FaBell />
            <span className="badge badge-warning navbar-badge">15</span>
          </a>
          <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
            <span className="dropdown-item dropdown-header">15 Notifications</span>
            <div className="dropdown-divider"></div>
            <a href="#" className="dropdown-item">
              <FaEnvelope className="mr-2" /> 4 new messages
              <span className="float-right text-muted text-sm">3 mins</span>
            </a>
            <div className="dropdown-divider"></div>
            <a href="#" className="dropdown-item dropdown-footer">See All Notifications</a>
          </div>
        </li>

        <li className="nav-item">
          <a className="nav-link" data-widget="fullscreen" href="#" role="button">
            <FaExpandArrowsAlt />
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-widget="control-sidebar" data-slide="true" href="#" role="button">
            <FaThLarge />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;