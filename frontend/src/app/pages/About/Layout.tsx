import React from 'react';
import Hayden from './hayden.jpeg';
import Kevin from './kevin.jpeg';
import Sahil from './sahil.jpeg';
import Darien from './darien.jpeg';
import Shannon from './shannon.jpeg';
import { Mail, Twitter, Linkedin } from '../../components/Icons/index';

const Bio = ({ name, role, bio, image, twitter, linkedin }: { name: string, role: string, bio: string, image: string, twitter?: string, linkedin?: string }) => {

    return (
        <li>
            <div className="flex items-center space-x-4 lg:space-x-6 mt-4">
                <img className="w-16 h-16 rounded-full lg:w-20 lg:h-20" src={image} alt="" />
                <div className="font-medium text-lg leading-6 space-y-1">
                    <h3>{name}</h3>

                    <p className="text-gray-600 text-sm">{role}</p>
                    <p className="text-gray-600 text-sm">{bio}<span> {twitter && <Twitter _style={{ height: 20, width: 20, marginTop: 2, cursor: 'pointer' }} onClick={() => window.open(twitter)} />} {linkedin && <Linkedin _style={{ height: 16, width: 16, marginTop: 2, cursor: 'pointer' }} onClick={() => window.open(linkedin)} />} </span></p>

                </div>
            </div>
        </li>
    )
}

const CicularButton = ({ children, className, onClick, style }) => {
    return (
        <button type="button" style={style ? style : {}} onClick={onClick} className={`inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-50 ${className}`}>
            {children}
        </button>
    )
}

export const Layout = () => {

    return (
        <div className="bg-white mb-16" style={{ minHeight: '70vh' }}>
            <div className="mx-auto py-12 px-4 max-w-4xl sm:px-6 lg:px-8 lg:py-12">
                <div className="grid grid-cols-1 gap-12 lg:gap-8 about-container">
                    <div></div>
                    <div>
                        <div className="space-y-5 sm:space-y-4">
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">About</h2>
                            <p className="text-xl text-gray-500">The #ConnectFamiliesNow Data Project is a project of <a className="underline" href="https://worthrises.org/">Worth Rises</a> and its volunteers.</p>
                            {/* <div className="text-md text-gray-500"><span>We hope to serve as a technical resource for the community of organizers working on prison profiteering. Get in touch!</span>
                                <span style={{ position: 'relative' }}>
                                    <CicularButton style={{ top: '-3px', position: 'absolute' }} className="ml-2" onClick={() => window.open('mailto:prison.telecom.data.project@gmail.com')}>
                                        <Mail _style={{ height: 16, width: 16 }} />
                                    </CicularButton>
                                </span>
                            </div> */}
                        </div>
                        {/* <div className="col-span-1 space-y-5 sm:space-y-4 sm:col-span-1">
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mt-8">Our Mission</h2>
                            <p className="text-xl text-gray-500">Make prison and jail communication free, nationwide.</p>
                            <p className="text-md text-gray-500">We draw our mission from <a className="underline cursor-pointer" onClick={() => window.open("https://connectfamiliesnow.com/")}>#ConnectFamiliesNow</a>.</p>
                            <p className="text-md text-gray-500">We believe that in a time of ubiquitous, free telecommunications products, it is unconscionable for incarcerated people and their families to be forced to pay to communicate.</p>
                        </div> */}
                        <div className="col-span-2 sm:col-span-2">
                            <div>
                                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mt-8">Team</h2>
                                <ul className="space-y-12 sm:grid sm:grid-cols-2 sm:gap-12 sm:space-y-0 lg:gap-x-8 mt-4">
                                    <Bio name={"Hayden Betts"} role={""} bio={"Hayden is an activist and software engineer."} image={Hayden} twitter={"https://twitter.com/haydenbetts"} />
                                    <Bio name={"Kevin O'Donnell"} role={""} bio={"Kevin is a field organizer for SURJ Ohio."} image={Kevin} linkedin={'https://www.linkedin.com/in/kevin-o-donnell-85772b57/'} />
                                    <Bio name={"Sahil Shah"} role={""} bio={"Sahil is a data engineer, and technical advisor to PTDP."} image={Sahil} linkedin={'https://www.linkedin.com/in/sahil-shah-83b64429/'} />
                                    <Bio name={"Darien Bryant"} role={""} bio={"Darien is an activist and software engineer."} image={Darien} linkedin={"https://www.linkedin.com/in/darien-bryant-m-s/"} />
                                    <Bio name={"Shannon Byrne"} role={""} bio={"Shannon is a social justice advocate and software engineer."} image={Shannon} linkedin={"https://www.linkedin.com/in/shannonleighbyrne"} />
                                </ul>
                            </div>
                        </div>
                        {/* <div className="sm:col-span-2">
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Partners</h2>

                    </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}