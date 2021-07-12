import React, { useState } from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro'
import { Phone, Avatar } from '../Icons';
import { useHistory } from 'react-router-dom';

type LogoType = {
  onClick?: any;
}

const Logo = ({ onClick }: LogoType) => (
  <span onClick={onClick}>
    {/* <Avatar size={12} bg={'green-500'}>
      <Phone size={28} fill={'white'} />
    </Avatar> */}
      <span className="ml-4 flex items-center" style={{fontWeight: 400}}>
      #ConnectFamiliesNOW Data Project
    </span>
  </span>
)

const LogoFull = ({ onClick }: LogoType) => {

  const history = useHistory();

  return (
    <div className="flex cursor-pointer" onClick={() => history.push('/')} style={{fontSize: 32}}>
      {/* <Logo onClick={() => history.push("/")} /> */}
      <span className="ml-4 flex items-center" style={{fontWeight: 400}}>
      #ConnectFamiliesNOW Data Project
    </span>
    </div>
  )
}
export function Nav() {
  const history = useHistory();

  const handleClick = (e) => {
    e.preventDefault();
    history.push(new URL(e.target.href).pathname)
  }

  const handleMobileClick = (e) => {
    e.preventDefault();
    handleClick(e);
    setTimeout(() => {
      setMobileMenuOpen(false);
    }, 200)
  }

  const getNavClass = (activePath) => {
    return history.location.pathname === activePath ? "nav-link-active" : "nav-link-inactive"
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  return (
    <Wrapper>
      <nav style={{height: 96}}>
        <div className="nav-container bg-purple text-white">
          <div className="relative flex justify-between h-24">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* <!-- Mobile menu button --> */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-white-400 hover:text-white-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500" aria-expanded="false">
                <span className="sr-only">Open main menu</span>
                {/* <!-- Icon when menu is closed. -->
                <!--
                  Heroicon name: menu

                  Menu open: "hidden", Menu closed: "block"
                --> */}
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* <!-- Icon when menu is open. -->
                <!--
                  Heroicon name: x

                  Menu open: "block", Menu closed: "hidden"
                --> */}
                <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start text-white">
              <div className="sm:flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  <div className="hidden lg:block w-auto" >
                    <LogoFull onClick={() => history.push("/")} />
                  </div>
                  <div className="block lg:hidden w-auto" >
                    <Logo onClick={() => history.push("/")} />
                  </div>
                  <div>

                  </div>
                  {/* <img className="block lg:hidden h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-green-600.svg" alt="Workflow" /> */}
                  {/* <img className="hidden lg:block h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-green-600-mark-gray-800-text.svg" alt="Workflow" /> */}
                </div>
                <div className="flex justify-end w-full">
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {/* <a href="/" onClick={handleClick} className={getNavClass("/")}>
                      Home
                  </a> */}
                    <a href="/data" onClick={handleClick} className={getNavClass("/data")}>
                      Data
                  </a>
                    <a href="/methods" onClick={handleClick} className={getNavClass("/methods")}>
                      Methods
                  </a>
                    {/* <a href="/resources" onClick={handleClick} className={getNavClass("/resources")}>
                      Resources
                  </a> */}
                    {/* <a href="/contact" onClick={handleClick} className={getNavClass("/contact")}>
                      Get Involved
                  </a> */}
                    <a href="/about" onClick={handleClick} className={getNavClass("/about")}>
                      About
                  </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="sm:hidden z-100 bg-purple shadow-lg rounded-md">
              <div className="pt-2 pb-4 space-y-1">
                <a href="/" className="bg-green-50 border-green-500 text-green-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Home</a>
                <a href="/data" onClick={handleMobileClick} className="border-transparent text-white-500 hover:bg-gray-50 hover:border-gray-300 hover:text-white-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Data</a>
                <a href="/methods" onClick={handleMobileClick} className="border-transparent text-white-500 hover:bg-gray-50 hover:border-gray-300 hover:text-white-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Methods</a>
                <a href="/resources" onClick={handleMobileClick} className="border-transparent text-white-500 hover:bg-gray-50 hover:border-gray-300 hover:text-white-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Resources</a>
                <a href="/about" onClick={handleMobileClick} className="border-transparent text-white-500 hover:bg-gray-50 hover:border-gray-300 hover:text-white-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">About Us</a>

              </div>
            </div>
          )}
        </div>
      </nav>
    </Wrapper>
  );
}

const Wrapper = styled.nav`
  display: flex;
  margin-right: -1rem;
`;

const Item = styled.a`
  color: ${p => p.theme.primary};
  cursor: pointer;
  text-decoration: none;
  display: flex;
  padding: 0.25rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  align-items: center;

  &:hover {
            opacity: 0.8;
  }

  &:active {
            opacity: 0.4;
  }

  .icon {
            margin - right: 0.25rem;
  }
`;
