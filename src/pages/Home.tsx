import React from 'react';
import Hero from '../components/Hero';
import WhyUs from '../components/WhyUs';
import Services from '../components/Services';
import Store from '../components/Store';
import Emergency from '../components/Emergency';
import Contact from '../components/Contact';

const Home: React.FC = () => {
    return (
        <>
            <Hero />
            <WhyUs />
            <Services />
            <Emergency />
            <Store />
            <Contact />
        </>
    );
};

export default Home;