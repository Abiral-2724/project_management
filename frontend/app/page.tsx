'use client'
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const PlanzoLandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const AsanaLogo = () => (
    <div className="flex items-center justify-center w-10 h-10">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="25" r="18" fill="#f06a6a" />
        <circle cx="30" cy="60" r="18" fill="#f06a6a" />
        <circle cx="70" cy="60" r="18" fill="#f06a6a" />
      </svg>
    </div>
  );

  const useCases = [
    {
      icon: "https://assets.asana.biz/transform/1fdda26a-ab23-4138-bd1a-956fca2c91cc/Illustration-ReportingTiles?io=transform:fill,width:2560&format=webp",
      title: 'Campaign management',
      description: 'Plan, track, and complete your campaigns all in one place.',
      link: 'See campaign management'
    },
    {
      icon: "https://assets.asana.biz/transform/5da0ba11-381c-4ce8-a264-0124cedbb07b/Illustration-EmptyCanvas?io=transform:fill,width:2560&format=webp",
      title: 'Creative production',
      description: 'Accelerate creative work by automating workflows from start to finish.',
      link: 'See creative production'
    },
    {
      icon: "https://assets.asana.biz/transform/9f8d6271-7b63-461c-bdaa-f51650301c8f/Illustration-ProjectManagement?io=transform:fill,width:2560&format=webp",
      title: 'Project intake',
      description: 'Capture, prioritize, and assign requests automatically so your teams have more time to work.',
      link: 'See project intake'
    },
    {
      icon: "https://assets.asana.biz/transform/e8d4bf6c-013f-4913-806d-c400279f18c0/Illustration-GetStartedRocket?io=transform:fill,width:2560&format=webp",
      title: 'Product launches',
      description: 'Coordinate teams, tasks, and timelines to keep every launch on schedule.',
      link: 'See project launches'
    },
    {
      icon: "https://assets.asana.biz/transform/ca22aeb3-c084-45e6-8fb8-3fb0fe716e31/Illustration-Reporting?io=transform:fill,width:2560&format=webp",
      title: 'Operations planning',
      description: 'Address business needs quickly by analyzing progress, bandwidth, and blockers on one platform.',
      link: 'See operations planning'
    },
    {
      icon: "https://assets.asana.biz/transform/bc22f3a7-b7d8-45de-9f38-8020a28ddcfb/Illustration-GoalTarget?io=transform:fill,width:2560&format=webp",
      title: 'Resource planning',
      description: 'Visualize how teams are staffed and what resources are available across your business.',
      link: 'See Resource planning'
    },
    {
      icon: "https://assets.asana.biz/transform/b5e5b9c5-4bf6-4c81-adc8-737a46805653/Illustration-ConnectivityPaperCutout?io=transform:fill,width:2560&format=webp",
      title: 'Goal management',
      description: 'Connect everyone work to the organizational goals they support.',
      link: 'See goal management'
    },
    {
      icon: "https://assets.asana.biz/transform/b5e5b9c5-4bf6-4c81-adc8-737a46805653/Illustration-ConnectivityPaperCutout?io=transform:fill,width:2560&format=webp",
      title: 'Employee onboarding',
      description: 'Standardize onboarding to help new employees make an impact quickly.',
      link: 'Employee onboarding'
    }
  ];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const cardWidth = 360;
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      
      const newSlide = direction === 'left' 
        ? Math.max(0, currentSlide - 1)
        : Math.min(useCases.length - 1, currentSlide + 1);
      setCurrentSlide(newSlide);
    }
  };

  const handleAuth = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-800">
                <img src="https://res.cloudinary.com/dci6nuwrm/image/upload/v1765728997/planzo-navbar-logo-black_vm2bqg.svg" alt="Planzo Logo" className="h-8" />
              </span>
            </div>
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">Product</NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">Solutions</NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">Resources</NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="ghost" className="text-sm">Pricing</Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Globe className="w-5 h-5" />
            </Button>
            <Button variant="ghost" className="text-sm hidden md:inline-flex">Contact sales</Button>
            <Button variant="ghost" className="text-sm hidden md:inline-flex" onClick={handleAuth}>
              {isLoggedIn ? 'Logout' : 'Login'}
            </Button>
            <Button className="bg-black text-white hover:bg-rose-400 hover:text-black">
              Get started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto px-6 pt-20 pb-16 bg-[#ffeaec]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-[#690031] mb-6 leading-tight">
              Where your teams<br />coordinate and work together
            </h1>
            <p className="text-lg md:text-xl text-[#690031] mb-10 max-w-3xl mx-auto">
              See how your work connects to goals while working alongside tools that<br className="hidden md:block" /> understand your business.
            </p>
            <div className="flex items-center justify-center space-x-4 flex-wrap gap-4">
              <Button size="lg" className="bg-[#690031] hover:bg-[#690020] text-[#FFEAEC] rounded-full px-8 py-6 text-lg">
                Get started
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-[#690031] text-[#690031] bg-[#ffeaec] hover:bg-[#ffd9dc] rounded-full px-8 py-6 text-lg">
                See how it works
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative mt-16">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-8 overflow-hidden relative min-h-[300px]">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop" alt="Team member" className="w-full h-64 object-cover rounded-2xl shadow-lg" />
              </div>
              
              <div className="flex-1 relative min-h-[300px] flex items-center justify-center">
                <Card className="w-full max-w-md shadow-2xl">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-100">
                        <div className="flex space-x-1 mr-1">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                        </div>
                        Planzo AI
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">Planzo AI wrote brief</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Card className="bg-gray-50 border-0">
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 mb-3">Here's a first draft based on your request:</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                          <span>Product launch brief - Draft</span>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center space-x-3 w-full">
                      <Avatar>
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop" />
                        <AvatarFallback>M</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm"><span className="font-semibold">Michelle</span> <span className="text-gray-500">approved brief</span></p>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="flex-1 bg-gradient-to-br from-amber-100 to-amber-50 rounded-3xl p-8 overflow-hidden relative min-h-[300px]">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop" alt="Team member" className="w-full h-64 object-cover rounded-2xl shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start justify-between mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              See how Planzo keeps<br />work moving across use<br />cases
            </h2>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                size="icon"
                onClick={() => scroll('left')}
                disabled={currentSlide === 0}
                className="bg-white rounded-full shadow-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button 
                size="icon"
                onClick={() => scroll('right')}
                disabled={currentSlide === useCases.length - 1}
                className="bg-black rounded-full shadow-lg hover:bg-gray-800 text-white disabled:opacity-50"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-hidden scroll-smooth pb-4"
          >
            {useCases.map((useCase, index) => (
              <Card key={index} className="flex-none w-80 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <img 
                    src={useCase.icon} 
                    alt="use case icon" 
                    className="w-20 h-20 object-contain mb-4"
                  />
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-gray-600">
                    {useCase.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="p-0 h-auto font-medium hover:gap-3 transition-all group">
                    <span>{useCase.link}</span>
                    <div className="bg-black rounded-full p-1 ml-2 group-hover:bg-gray-800 transition-colors">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">Get started easily</h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              Tour the platform, read a few deep dives, or kickstart your work management journey with the right template.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-8 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer group">
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-900">Try the Planzo demo</h3>
                <p className="text-gray-600">See Planzo in action</p>
              </div>
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChevronRight className="text-white" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer group">
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-900">Discover resources</h3>
                <p className="text-gray-600">Help articles and tutorials</p>
              </div>
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChevronRight className="text-white" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer group">
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-900">Start with a template</h3>
                <p className="text-gray-600">Get started faster with a template</p>
              </div>
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChevronRight className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-screen bg-[#690031] flex items-center justify-center p-8">
        <div className="max-w-6xl w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
            <div className="text-[#FFEAEC] max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                The only platform that can support your company at any scale
              </h1>
            </div>
            
            <div>
              <Button className="bg-pink-100 text-gray-900 px-8 py-6 rounded-full text-lg font-medium hover:bg-pink-200 transition-colors">
                Get started
              </Button>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-white/20">
            <p className="text-white/70 text-sm">
              1. Accurate as of December 2023, includes free and paid users.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#710C3A] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-white">
            <div className="flex items-center gap-8 flex-wrap justify-center">
              <AsanaLogo />
              <p className="text-sm">© 2025 Planzo, Inc.</p>
              <div className="flex items-center gap-2 text-sm cursor-pointer hover:underline">
                <Globe className="w-5 h-5" />
                <span>English</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <a href="#" className="text-sm hover:underline">Terms & Privacy</a>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:opacity-80">
                <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on App Store" className="h-10"/>
              </a>
              <a href="#" className="hover:opacity-80">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-10"/>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <Button 
        size="icon"
        className="fixed bottom-8 right-8 bg-red-500 hover:bg-red-600 rounded-full h-16 w-16 shadow-2xl hover:scale-110 transition-transform z-50"
      >
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </Button>
    </div>
  );
};

export default PlanzoLandingPage;