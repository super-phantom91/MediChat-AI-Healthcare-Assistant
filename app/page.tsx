"use client";

import { motion } from "framer-motion";
import { FaStethoscope, FaShieldAlt, FaBrain, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white text-xl font-bold"
        >
          MediChat
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-4"
        >
          <button className="text-white hover:text-orange-400 transition-colors">
            About
          </button>
          <button className="text-white hover:text-orange-400 transition-colors">
            Features
          </button>
          <button className="text-white hover:text-orange-400 transition-colors">
            Contact
          </button>
        </motion.div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Section - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="block text-orange-400">Medichat</span>
                <span className="block text-white">AI that cares</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-xl text-gray-300 leading-relaxed max-w-lg"
              >
                A modern AI-powered solution that helps you manage your health, check symptoms, and access medical knowledge instantly.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-orange-400 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 hover:bg-orange-500 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started <FaArrowRight className="text-sm" />
              </motion.button>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/signin"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-slate-900 transition-all duration-300 inline-flex items-center justify-center"
                >
                  Sign In
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Section - Feature Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 1.1, type: "spring" }}
                className="bg-orange-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaStethoscope className="text-white text-3xl" />
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                className="text-2xl font-bold text-slate-800 text-center mb-4"
              >
                Medical Assistant
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                className="text-slate-600 text-center mb-6 leading-relaxed"
              >
                Your intelligent healthcare companion powered by advanced AI. Get instant answers and personalized health insights.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.7 }}
                className="flex flex-wrap gap-3 justify-center"
              >
                <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700">AI Powered</span>
                </div>
                
                <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-full">
                  <FaShieldAlt className="text-orange-400 text-sm" />
                  <span className="text-sm font-medium text-slate-700">Secure</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full opacity-60"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full opacity-60"
      />
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-orange-300 rounded-full opacity-60"
      />
    </div>
  );
}
