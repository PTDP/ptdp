import * as React from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro'
import { Phone, Avatar } from '../Icons';
import { useHistory } from 'react-router-dom';

const Logo = () => (
  <Avatar size={12} bg={'green-500'}>
    <Phone size={28} fill={'white'} />
  </Avatar>
)

const LogoFull = () => {

  const history = useHistory();

  return (
    <div className="flex cursor-pointer" onClick={() => history.push('/')}>
      <Logo />
      <span className="ml-4 flex items-center font-bold">
        Prison Telecom Data Project
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

  const getNavClass = (activePath) => {
    console.log('activePath', history.location.pathname)
    return history.location.pathname === activePath ? "nav-link-active" : "nav-link-inactive"
  }


  return (
    <Wrapper>
      <nav>
        <div className="nav-container">
          <div className="relative flex justify-between h-16">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* <!-- Mobile menu button --> */}
              <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-expanded="false">
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
            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
              <div className="sm:flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  <div className="hidden lg:block w-auto" >
                    <LogoFull />
                  </div>
                  <div className="block lg:hidden w-auto" >
                    <Logo />
                  </div>
                  <div>

                  </div>
                  {/* <img className="block lg:hidden h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg" alt="Workflow" /> */}
                  {/* <img className="hidden lg:block h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-indigo-600-mark-gray-800-text.svg" alt="Workflow" /> */}
                </div>
                <div className="flex justify-end w-full">
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <a href="/" onClick={handleClick} className={getNavClass("/")}>
                      Home
                  </a>
                    <a href="/data" onClick={handleClick} className={getNavClass("/data")}>
                      Data
                  </a>
                    <a href="/methods" onClick={handleClick} className={getNavClass("/methods")}>
                      Methods & FAQ
                  </a>
                    <a href="/resources" onClick={handleClick} className={getNavClass("/resources")}>
                      Resources
                  </a>
                    {/* <a href="/contact" onClick={handleClick} className={getNavClass("/contact")}>
                      Get Involved
                  </a> */}
                    <a href="/about" onClick={handleClick} className={getNavClass("/about")}>
                      About Us
                  </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden sm:hidden">
            <div className="pt-2 pb-4 space-y-1">      <a href="#" className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Dashboard</a>
              <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Team</a>
              <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Projects</a>
              <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Calendar</a>
            </div>
          </div>
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
