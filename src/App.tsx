//import { useState } from 'react'
/* import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg' */
import Header from './components/Header';
import Hero from './components/Hero';
import WhyUs from './components/WhyUs'; // Este componente hay que crearlo también
import Services from './components/Services';
import Footer from './components/Footer';
import './App.css'

function App() {
  /* const [count, setCount] = useState(0) */

  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <WhyUs />
        <Services />
      </main>
      <Footer />
    </div>
  )
}

export default App
