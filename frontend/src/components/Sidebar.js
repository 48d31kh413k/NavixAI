import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();

    const navigationItems = [
        {
            path: '/',
            icon: '🏠',
            label: 'Dashboard',
            description: 'Overview and activities'
        },
        {
            path: '/user-preferences',
            icon: '❤️',
            label: 'My Preferences',
            description: 'Liked and disliked places'
        },
        {
            path: '/preferences',
            icon: '⚙️',
            label: 'Settings',
            description: 'App configuration'
        }
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            {/* Logo Section */}
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">✱</span>
                    <span className="logo-text">logo</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navigationItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        title={item.label}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <div className="nav-content">
                            <span className="nav-label">{item.label}</span>
                            <span className="nav-description">{item.description}</span>
                        </div>
                    </Link>
                ))}
            </nav>

            {/* User Profile Section */}
            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        <span>👤</span>
                    </div>
                    <div className="user-info">
                        <div className="user-name">User Profile</div>
                        <div className="user-status">Personalized Experience</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;