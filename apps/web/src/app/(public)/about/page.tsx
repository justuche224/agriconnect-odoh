"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Heart,
  Leaf,
  MapPin,
  ShoppingCart,
  TrendingUp,
  Award,
  Truck,
  Shield,
  Globe,
  Target,
  Handshake,
} from "lucide-react";

const AboutPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const stats = [
    { icon: Users, value: "500+", label: "Local Farmers" },
    { icon: ShoppingCart, value: "50K+", label: "Happy Customers" },
    { icon: TrendingUp, value: "1M+", label: "Products Sold" },
    { icon: Globe, value: "15+", label: "Communities Served" },
  ];

  const features = [
    {
      icon: Heart,
      title: "Community First",
      description:
        "We believe in building strong relationships between farmers and consumers, fostering a sense of community around fresh, local food.",
    },
    {
      icon: Leaf,
      title: "Sustainable Practices",
      description:
        "Supporting environmentally friendly farming methods that protect our planet while delivering the highest quality produce.",
    },
    {
      icon: MapPin,
      title: "Local Impact",
      description:
        "Every purchase directly supports local farmers in your community, reducing carbon footprint and strengthening local economies.",
    },
    {
      icon: Award,
      title: "Quality Assured",
      description:
        "We partner only with certified organic and sustainable farms, ensuring you receive the freshest, highest quality products.",
    },
    {
      icon: Truck,
      title: "Farm to Door",
      description:
        "Our efficient delivery system brings fresh produce directly from the farm to your doorstep, maintaining peak freshness.",
    },
    {
      icon: Shield,
      title: "Trust & Transparency",
      description:
        "Complete transparency in our supply chain, so you know exactly where your food comes from and how it's grown.",
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Founded",
      description: "Started with 10 local farmers",
    },
    { year: "2021", title: "Growth", description: "Expanded to 100+ farmers" },
    {
      year: "2022",
      title: "Recognition",
      description: "Awarded 'Best Local Marketplace'",
    },
    { year: "2023", title: "Innovation", description: "Launched mobile app" },
    { year: "2024", title: "Future", description: "500+ farmers and growing" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mx-auto mb-6 bg-white/20 text-white border-white/30">
              <Leaf className="w-3 h-3 mr-1" />
              About AgriConnect
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connecting Communities Through Fresh Food
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              We're bridging the gap between local farmers and conscious
              consumers, creating a sustainable marketplace that benefits
              everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 px-8"
              >
                <Link href="/shop">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Start Shopping
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-600 px-8"
              >
                <Link href="/shop/farmers">
                  <Users className="w-4 h-4 mr-2" />
                  Meet Our Farmers
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20 bg-green-50 dark:bg-green-900/10"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <stat.icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {stat.value}
                    </div>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
            <div className="w-20 h-1 bg-green-600 mx-auto mb-6" />
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              To create a sustainable, transparent marketplace that connects
              local farmers with conscious consumers, fostering community
              relationships while promoting environmental stewardship and
              supporting local economies.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-green-50 dark:bg-green-900/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <div className="w-20 h-1 bg-green-600 mx-auto mb-6" />
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From humble beginnings to becoming the region's leading farmers
              market platform.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-green-300 hidden md:block" />
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`relative flex items-center mb-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div
                  className={`w-full md:w-1/2 ${
                    index % 2 === 0 ? "md:pr-8" : "md:pl-8"
                  }`}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-3">
                        <Badge className="bg-green-600 text-white">
                          {milestone.year}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {milestone.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full border-4 border-background" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <div className="w-20 h-1 bg-green-600 mx-auto mb-6" />
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {[
              {
                icon: Target,
                title: "Transparency",
                description:
                  "Complete visibility into our supply chain, from farm to table.",
              },
              {
                icon: Handshake,
                title: "Fair Trade",
                description:
                  "Ensuring fair compensation for farmers and fair prices for customers.",
              },
              {
                icon: Leaf,
                title: "Sustainability",
                description:
                  "Supporting environmentally responsible farming practices.",
              },
              {
                icon: Heart,
                title: "Community",
                description:
                  "Building lasting relationships that strengthen local communities.",
              },
            ].map((value, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-green-100">
              Whether you're a farmer looking to connect with customers or a
              consumer seeking fresh, local produce, we're here to help you
              thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 px-8"
              >
                <Link href="/shop">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Start Shopping
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-600 px-8"
              >
                <Link href="/shop/farmers">
                  <Users className="w-4 h-4 mr-2" />
                  Become a Farmer
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutPage;
