"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Users,
  MapPin,
  Star,
  ArrowRight,
  Leaf,
  Heart,
} from "lucide-react";
import Link from "next/link";

const Homepage = () => {
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

  return (
    <div className="bg-background pt-20">
      {/* Hero Section */}
      <div className="hero pt-20 -mt-20 flex flex-col justify-between min-h-screen bg-[url(/images/hero-bg.png),linear-gradient(#000,#000)] bg-cover overflow-hidden">
        <section className="hero text-center grow flex flex-col justify-center gap-6 bg-[linear-gradient(transparent,#173704dd_10%_90%,transparent)] min-h-[70vh] text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mx-auto mb-4 bg-green-600/20 text-green-400 border-green-600/50">
              <Leaf className="w-3 h-3 mr-1" />
              Farm Fresh • Local • Organic
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold max-w-4xl mx-auto mb-6 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              Your Local Farmers Market, Delivered
            </h1>
            <p className="max-w-2xl mx-auto font-light text-lg md:text-xl text-gray-200 mb-8">
              Connect directly with local farmers and discover fresh, organic
              produce. Supporting sustainable agriculture while bringing the
              best of farm-to-table right to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                <Link href="/shop">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Shop Now
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-700 px-8"
              >
                <Link href="/shop/farmers">
                  <Users className="w-4 h-4 mr-2" />
                  Meet Our Farmers
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={
              "hero-image-wrapper relative w-fit mx-auto mt-auto rounded-full border-2 border-green-400/50 p-6 " +
              "before:absolute before:top-8 before:left-8 before:right-8 before:bottom-8 before:border before:border-green-400/30 before:rounded-full" +
              " after:absolute after:-top-8 after:-left-8 after:-right-8 after:-bottom-8 after:border after:border-green-400/20 after:rounded-full"
            }
          >
            <Image
              src="/images/black-man.png"
              width={666}
              height={666}
              alt="Local farmer"
              className="w-64 h-64 scale-150 -mt-10"
            />
          </motion.div>
        </section>
      </div>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 bg-green-50 dark:bg-green-900/20"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <motion.div variants={fadeInUp}>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-gray-600 dark:text-gray-300">Local Farmers</p>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="text-4xl font-bold text-green-600 mb-2">50k+</div>
              <p className="text-gray-600 dark:text-gray-300">
                Happy Customers
              </p>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="text-4xl font-bold text-green-600 mb-2">1M+</div>
              <p className="text-gray-600 dark:text-gray-300">Products Sold</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Quote Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center"
      >
        <div className="container mx-auto px-4">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl font-light italic"
          >
            "Fresh from farm to table, supporting local communities one harvest
            at a time"
          </motion.blockquote>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Our Farmers Market?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the freshest produce, support local farmers, and enjoy
              the convenience of online shopping with farm-fresh quality.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">100% Organic</h3>
                  <p className="text-muted-foreground">
                    All our produce is certified organic, grown without harmful
                    pesticides or chemicals, ensuring the healthiest options for
                    your family.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Local Sourcing</h3>
                  <p className="text-muted-foreground">
                    Support your local community by purchasing directly from
                    farmers in your area. Fresher produce with a smaller carbon
                    footprint.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Fair Trade</h3>
                  <p className="text-muted-foreground">
                    Fair prices for farmers and transparent pricing for
                    customers. Building sustainable relationships that benefit
                    everyone.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-green-50 dark:bg-green-900/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fresh Categories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our wide selection of fresh, seasonal produce directly from
              local farms.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Fresh Vegetables",
                desc: "Crisp, colorful vegetables picked at peak ripeness",
                image: "/images/waterfall-1.png",
              },
              {
                title: "Seasonal Fruits",
                desc: "Sweet, juicy fruits harvested at perfect timing",
                image: "/images/waterfall-2.png",
              },
              {
                title: "Organic Herbs",
                desc: "Aromatic herbs and spices grown with care",
                image: "/images/waterfall-3.png",
              },
            ].map((category, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={category.image}
                      width={400}
                      height={300}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-semibold mb-1">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-200">{category.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular items, carefully selected from the best
              local farms.
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center gap-8 flex-wrap"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer max-w-md">
                <Image
                  src="/images/cereal-card.png"
                  width={400}
                  height={300}
                  alt="Organic Grains & Cereals"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">Organic Grains</h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm text-muted-foreground">
                        4.9
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Premium quality grains and cereals, perfect for healthy
                    meals.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/shop">
                      Shop Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer max-w-md">
                <Image
                  src="/images/machine-card.png"
                  width={400}
                  height={300}
                  alt="Farm Equipment & Tools"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">Farm Tools</h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm text-muted-foreground">
                        4.8
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Quality farming equipment and tools for your gardening
                    needs.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/shop">
                      Shop Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-green-100">
              Join thousands of customers who trust us for their fresh, organic
              produce. Start your farm-to-table journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 px-8"
              >
                <Link href="/shop">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Browse Products
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
                  Meet Farmers
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Homepage;
