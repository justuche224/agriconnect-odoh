import React from "react";
import Image from "next/image";

export const metadata = {
  title: "Home",
  description: "A platform where farmers and customers interact",
};

const Homepage = () => {
  return (
    <div className="">
      <div className="hero pt-20 -mt-20 flex flex-col justify-between h-screen bg-[url(/images/hero-bg.png),linear-gradient(#000,#000)] bg-black overflow-hidden">
        <section className="hero text-center grow flex flex-col justify-center gap-4 bg-[linear-gradient(transparent,#173704dd_10%_90%,transparent)] min-h-[70vh] text-white">
          <h1 className="text-3xl max-w-xl mx-auto mt-auto mb-4">
            From Seed to Harvest, Farm Smarter
          </h1>
          <p className="max-w-lg mx-auto font-light">
            Revolutionize your agricultural workflow. Our intuitive tools enable
            real-time monitoring, automated reporting, and precision farming
          </p>
          <div
            className={
              "hero-image-wrapper relative w-fit mx-auto mt-auto rounded-full border p-6 " +
              "before:absolute before:top-8 before:left-8 before:right-8 before:bottom-8 before:border before:border-white before:rounded-full" +
              " after:absolute after:-top-8 after:-left-8 after:-right-8 after:-bottom-8 after:border after:border-white after:rounded-full"
            }
          >
            <Image
              src="/images/black-man.png"
              width={666}
              height={666}
              alt="A farmer"
              className="w-64 h-64 scale-150 -mt-10"
            />
          </div>
        </section>
      </div>

      <div className="px-1">
        <hr className="my-3 h-3 bg-gray-300" />
        <section className="quote text-center bg-gray-300 p-2 text-gray-800 text-lg">
          {"“Technology doesn't replace the farmer, it amplifies their yield”"}
        </section>
        <hr className="my-3 h-3 bg-gray-300" />

        <h2 className="text-2xl max-w-md my-8 md:ml-12">
          Procure all your farm inputs seamlessly with crypto payments:{" "}
          <span className="text-gray-700">
            including Seedlings, Fertilizers and Farm tools
          </span>
        </h2>

        <div className="water-fall-wrapper my-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:48px_48px]">
            <div className="absolute left-0 right-0 top-0 bottom-0 -z-10 m-auto h-[510px] w-[310px] rounded-full bg-[#51CA0687] blur-[100px]"></div>
          </div>
          <div className="container mx-auto">
            <div className="waterfall-pair my-8 flex gap-12 items-center justify-center">
              <div className="info max-w-sm">
                <h3 className="text-2xl text-gray-700">
                  Different varieties of Seedlings:
                </h3>
                <p>
                  Boost yields with crypto-bought seedlings: efficient,
                  cost-effective, and hassle-free
                </p>
              </div>
              <div className="image-wrapper relative p-4 rounded-xl bg-gradient-to-t from-gray-300 ring ring-gray-300 w-40 h-auto before:absolute before:w-2 before:h-40 before:top-full before:left-1/2 before:bg-gradient-to-b before:from-gray-300">
                <Image
                  src="/images/waterfall-1.png"
                  width={234.06}
                  height={322.08}
                  alt="Closeup picture of a crop"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="waterfall-pair md:translate-x-20 my-8 flex gap-32 items-center justify-center">
              <div className="info max-w-sm">
                <h3 className="text-2xl text-gray-700">
                  Mechanized farm tools:
                </h3>
                <p>
                  Where technology meets agriculture: fully mechanized farming
                </p>
              </div>
              <div className="image-wrapper relative p-4 rounded-xl bg-gradient-to-t from-gray-300 ring ring-gray-300 w-40 h-auto before:absolute before:w-2 before:h-40 before:top-full before:left-1/2 before:bg-gradient-to-b before:from-gray-300">
                <Image
                  src="/images/waterfall-2.png"
                  width={234.06}
                  height={322.08}
                  alt="Closeup picture of a crop"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="waterfall-pair md:-translate-x-20 my-8 flex gap-12 items-center justify-center">
              <div className="info max-w-sm">
                <h3 className="text-2xl text-gray-700">
                  Environmental friendly fertilizers:
                </h3>
                <p>Cultivate sustainability with eco-friendly fertilizers</p>
              </div>
              <div className="image-wrapper relative p-4 rounded-xl bg-gradient-to-t from-gray-300 ring ring-gray-300 w-40 h-auto before:absolute before:w-2 before:h-40 before:top-full before:left-1/2 before:bg-gradient-to-b before:from-gray-300">
                <Image
                  src="/images/waterfall-3.png"
                  width={234.06}
                  height={322.08}
                  alt="Closeup picture of a crop"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <section className="wheat">
          <h2 className="text-2xl max-w-md md:ml-12">
            Get the exact market prices At your finger Tip:{" "}
            <span className="text-gray-700">Be the first to know </span>
          </h2>
        </section>
        <Image
          src="/images/wheat.svg"
          width={1440}
          height={1020}
          className="w-screen"
          alt="Closeup picture of wheat harvest. bowl of harvested wheat"
        />

        <div className="cards-wrapper container mx-auto flex justify-evenly flex-wrap gap-2 my-8 ">
          <Image
            src="/images/cereal-card.png"
            width={620}
            height={516}
            alt="Cereals"
            className="w-96"
          />
          <Image
            src="/images/machine-card.png"
            width={613}
            height={516}
            alt="Machines"
            className="w-96"
          />
        </div>
        <h2 className="text-2xl max-w-md md:ml-12 my-12">
          Stay Updated about the ravaging pest diseases and their seasons:{" "}
          <span className="text-gray-700">Beware and take caution too</span>
        </h2>

        <section className="tomato relative container mx-auto flex justify-around">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_70%,#000_110%)]"></div>
          <div className="info">
            <h3 className="text-2xl max-w-md my-4">
              Tomato Disease:{" "}
              <span className="text-gray-700">
                {" "}
                Early Blight (Alternaria solani)
              </span>
            </h3>

            <h4 className="font-bold text-xl my-2">Symptoms:</h4>

            <ol className="list-decimal ml-4">
              <li>Yellowing or chlorotic leaves</li>
              <li>Black or brown spots on lower leaves</li>
              <li>Lesions with concentric rings (target-like)</li>
              <li>Defoliation and reduced fruit production</li>
            </ol>

            <h4 className="font-bold text-xl my-2">Management:</h4>

            <ol className="list-decimal ml-4">
              <li>Crop rotation and sanitation</li>
              <li>Remove infected leaves and debris</li>
            </ol>

            <h4 className="font-bold text-xl my-2">Prevention:</h4>

            <ol className="list-decimal ml-4">
              <li>Use disease-free seeds</li>
              <li>Maintain soil health and fertility</li>
            </ol>
          </div>
          <div className="img-wrapper h-[30rem]">
            <Image
              src="/images/tomato.png"
              width={730}
              height={1131}
              alt="Closeup picture of Tomato"
              className="h-full w-full rounded-xl object-contain"
            />
          </div>
        </section>

        <hr className="my-3 h-3 bg-gray-300" />
        <section className="quote text-center bg-gray-300 p-2 text-gray-800 text-lg">
          {'"Insights today, increased yields tomorrow."'}
        </section>
        <hr className="my-3 h-3 bg-gray-300" />
      </div>
    </div>
  );
};

export default Homepage;
