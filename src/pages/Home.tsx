import React from 'react';
import Hero from '../components/Hero';
import WhyUs from '../components/WhyUs';
import Services from '../components/Services';

const Home: React.FC = () => {
    return (
        <>
            <Hero />
            <WhyUs />
            <Services />
        </>
    );
};

export default Home;