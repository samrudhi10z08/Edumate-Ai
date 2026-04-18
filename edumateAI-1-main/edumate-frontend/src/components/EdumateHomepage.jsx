import React from "react";
import about_img from "../assets/about_img.png"
import home_img from "../assets/home.png"
import { useState } from "react";
export default function EdumateHome() {
  return (
    <div className="min-h-screen w-full bg-white text-slate-800 font-sans">
      <Navbar />
      <Hero />
      
      <Services />
      <WhyUs />
      <Contact />
      <Footer />
    </div>
  );
}

/* NAVBAR */
function Navbar() {
     const [open, setOpen] = useState(false);
  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white/90 backdrop-blur shadow-sm">
      <div className="w-full px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-indigo-700">Edumate AI</div>
        <nav className="hidden md:flex gap-8 font-medium text-sm">
          <a href="#services" className="hover:text-indigo-600">Features</a>
           <a href="/login" className="hover:text-indigo-600">Login</a>
          <a href="#whyus" className="hover:text-indigo-600">Why Us</a>
          <a href="#contact" className="hover:text-indigo-600">Contact</a>
        </nav>

       {/* Mobile Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-3xl text-indigo-700"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white shadow-lg border-t transition-all duration-300 overflow-hidden 
          ${open ? "max-h-60" : "max-h-0"}
        `}
      >
        <nav className="flex flex-col px-6 py-4 gap-4 font-medium text-base">
          <a href="#services" className="hover:text-indigo-600" onClick={() => setOpen(false)}>Features</a>
          <a href="/login" className="hover:text-indigo-600" onClick={() => setOpen(false)}>Login</a>
          <a href="#whyus" className="hover:text-indigo-600" onClick={() => setOpen(false)}>Why Us</a>
          <a href="#contact" className="hover:text-indigo-600" onClick={() => setOpen(false)}>Contact</a>
        </nav>
     
      </div>

    </header>
  );
}

/* HERO SECTION */
function Hero() {
  return (
    <section className="pt-28 md:pt-32 pb-16 bg-linear-to-br from-indigo-700 to-indigo-500 text-white">
      <div className="w-full px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Edumate AI-Smart Academic Assistant
          </h1>
          <p className="mt-5 text-lg text-indigo-100">
            Face recognition login, OCR-based data entry, ML performance analytics,
            and stress detection — everything to make academics smarter.
          </p>

          <div className="mt-8 flex gap-4">
            <a href="#services" className="px-6 py-3 rounded-full bg-white text-indigo-700 font-bold shadow hover:bg-slate-100">
              Explore Features
            </a>
            <a href="#contact" className="px-6 py-3 rounded-full  bg-white text-indigo-700 font-bold shadow hover:bg-slate-100">
              Contact Us
            </a>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden shadow-xl">
            <img
           src={home_img}
              className="w-full h-auto rounded-xl shadow-lg"
              alt="About"
                  />

        </div>
      </div>
    </section>
  );
}

/* ABOUT SECTION */
/*function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
<img
           src={about_img}
              className="w-full h-auto rounded-xl shadow-lg"
              alt="About"
                  />

        <div>
          <h2 className="text-3xl font-bold">Reimagining Academic Workflows</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Edumate AI automates time-consuming academic tasks through face
            recognition login, OCR-based attendance and marks entry, and
            intelligent performance analysis. Our mission is to help institutions
            save time, reduce manual effort, and improve accuracy.
          </p>
        </div>
      </div>
    </section>
  );
}
*/
/* SERVICES / FEATURES */
function Services() {
  const features = [
    {
      title: "Face Recognition Login",
      desc: "Secure biometric authentication for students.",
    },
    {
      title: "OCR  Marks Entry",
      desc: "Upload sheets and let OCR extract the details",
    },
    {
      title: "ML-Based Performance Insights",
      desc: "Predict trends, identify weak areas, track improvements.",
    },
    {
      title: "Stress Detection",
      desc: "AI measures stress levels.",
    },
  ];

  return (
    <section id="services" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center">Our Core Features</h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 bg-white rounded-xl shadow border hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-indigo-700">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* WHY US */
function WhyUs() {
  return (
    <section id="whyus" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold">Why Choose Edumate AI?</h2>
        <p className="mt-4 text-slate-600 max-w-3xl mx-auto">
          Our academic AI system is built for students who often struggle to manage studies and stress.Our system will help students to 
          improve in academics.
         
        </p>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card title="99% Accuracy" text="Machine learning ensures precise predictions and OCR results." />
          <Card title="Secure & Reliable" text="Enterprise-grade biometric and data protection systems." />
          <Card title="Mobile-Friendly" text="Designed for all devices with top-tier responsiveness." />
        </div>
      </div>
    </section>
  );
}

function Card({ title, text }) {
  return (
    <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition bg-slate-50">
      <h3 className="text-xl font-semibold text-indigo-700">{title}</h3>
      <p className="mt-2 text-slate-600 text-sm">{text}</p>
    </div>
  );
}

/* CONTACT */
function Contact() {
  return (
    <section id="contact" className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold">Get In Touch</h2>
        <p className="mt-3 text-slate-600">Reach out for demo, collaboration, or integration support.</p>

        <form className="mt-10 grid gap-4">
          <input type="text" placeholder="Your Name" className="p-3 border rounded-lg w-full" />
          <input type="email" placeholder="Your Email" className="p-3 border rounded-lg w-full" />
          <textarea placeholder="Message" className="p-3 border rounded-lg w-full h-32" />
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

/* FOOTER */
function Footer() {
  return (
    <footer className="py-10 bg-indigo-700 text-indigo-100 text-center text-sm">
      © {new Date().getFullYear()} Edumate AI. All rights reserved.
    </footer>
  );
}