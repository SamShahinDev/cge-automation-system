import React from 'react';
import { CheckCircle, Rocket, Clock, Headphones } from 'lucide-react';

export default function PhaseLaunch() {
  const checklist = [
    'Final testing & QA',
    'Data migration',
    'Team training sessions',
    'Documentation handoff',
    'Go-live support'
  ];

  const supportFeatures = [
    'On-call support',
    'Quick fixes included',
    'Training recordings'
  ];

  return (
    <div className="min-h-screen bg-white flex items-center">
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            {/* Phase indicator */}
            <div className="inline-block">
              <span className="text-primary font-semibold text-lg">Phase 3</span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-gray-900">Launch</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span className="text-lg">1 week</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xl text-gray-600 leading-relaxed">
              Smooth transition to your new system
            </p>

            {/* Launch checklist */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900">Launch Checklist</h3>
              <div className="space-y-3">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support commitment */}
            <div className="border-2 border-primary rounded-xl p-6 space-y-4 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <Headphones className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-semibold text-gray-900">
                  We're here for launch day
                </h3>
              </div>
              <div className="space-y-2 pl-9">
                {supportFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative flex items-center justify-center">
            {/* Rocket launch illustration */}
            <div className="relative w-full max-w-md aspect-square">
              {/* Background circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-100 rounded-full"></div>

              {/* Rocket */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative animate-bounce-slow">
                  <Rocket className="w-32 h-32 text-primary transform rotate-45" strokeWidth={1.5} />

                  {/* Rocket trail/exhaust */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full opacity-70 animate-pulse"></div>
                      <div className="w-3 h-3 bg-orange-500 rounded-full opacity-50 animate-pulse delay-75"></div>
                      <div className="w-4 h-4 bg-red-400 rounded-full opacity-30 animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orbiting checkmarks */}
              <div className="absolute inset-0 animate-spin-slow">
                <CheckCircle className="absolute top-8 right-8 w-8 h-8 text-green-500" />
              </div>
              <div className="absolute inset-0 animate-spin-slow-reverse">
                <CheckCircle className="absolute bottom-12 left-12 w-6 h-6 text-green-500" />
              </div>
              <div className="absolute inset-0 animate-spin-slow delay-300">
                <CheckCircle className="absolute top-1/2 right-4 w-7 h-7 text-green-500" />
              </div>

              {/* Stars/sparkles */}
              <div className="absolute top-12 left-16 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute top-24 right-20 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse delay-100"></div>
              <div className="absolute bottom-20 right-12 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-200"></div>
              <div className="absolute bottom-32 left-8 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
