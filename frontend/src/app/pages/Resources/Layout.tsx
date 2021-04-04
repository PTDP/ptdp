import React from 'react';

export const Layout = () => {

    return (
        <div className="bg-white mb-16" style={{ minHeight: '70vh' }}>
            <div className="mx-auto py-12 px-4 max-w-4xl sm:px-6 lg:px-8 lg:py-12">
                <div className="grid grid-cols-1 gap-12 lg:gap-8 about-container">
                    <div></div>
                    <div>
                        <div className="space-y-5 sm:space-y-4">
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Background</h2>
                            <p className="text-xl text-gray-500">Learn about the history and operations of the prison telecom industry.</p>
                            <div className="text-md text-gray-500">
                                <div>
                                    <span><a className={"underline cursor-pointer"} onClick={() => window.open("https://worthrises.org/courseintroduction")}>The Prison Industry: The Curriculum</a> - Worth Rises, 2021</span>
                                </div>
                                <div className="mt-2">
                                    <span><a className={"underline cursor-pointer"} onClick={() => window.open("https://www.prisonpolicy.org/phones/state_of_phone_justice.html")}>State of Phone Justice</a> - Peter Wagner and Alexi Jones, Prison Policy Initiative, 2019</span>
                                </div>
                                <div className="mt-2">
                                    <span><a className={"underline cursor-pointer"} onClick={() => window.open("https://www.theverge.com/a/prison-phone-call-cost-martha-wright-v-corrections-corporation-america")}>Criminal Charges</a> - Colin Lecher, The Verge, 2019</span>
                                </div>
                                <div className="mt-2">
                                    <span><a className={"underline cursor-pointer"} onClick={() => window.open("https://art19.com/shows/pod-save-the-people/episodes/ea4705b3-b214-459a-bd79-a43b17c0329d")}>FCC & Me</a> - DeRay McKesson and Lee G. Petro, Pod Save the People, 2017</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-5 sm:space-y-4 mt-8">
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Activism</h2>
                            <p className="text-xl text-gray-500">These groups are working to bring justice to the prison telecom system through activism, lawsuits, and technical interventions.</p>
                            <div className="text-md text-gray-500">
                                <div>
                                    <span><a className={"underline cursor-pointer"} onClick={() => window.open("https://connectfamiliesnow.com/")}>#ConnectFamiliesNow</a> - a collective of national, state, and local organizations fighting to connect families with incarcerated loved ones by making communication free.</span>
                                </div>
                                <div className="mt-2">
                                    <span><a className={"underline cursor-pointer"} onClick={() => window.open("https://www.prisonphonejustice.org/")}>Campaign for Prison Phone Justice</a> - A project of the <a className="cursor-pointer underline" onClick={() => window.open("https://www.humanrightsdefensecenter.org/")}>Human Rights Defense Center</a></span>
                                </div>
                                <div className="mt-2">
                                    <span><a className={"underline cursor-pointer"} onClick={() => window.open("https://ameelio.org/#/")}>Ameelio</a> - A tech non-profit that allows family members to send free letters, cards & photos to incarcerated people.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}