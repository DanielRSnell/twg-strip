import DynamicIcon from "@/helpers/DynamicIcon";
import { markdownify } from "@/lib/utils/textConverter";
import React, { useState } from "react";

const ServiceSlider = ({ feature }: { feature: any }) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <>
      <div
        className="w-full md:w-1/2"
        data-aos="fade-up-sm"
        data-aos-delay="200"
      >
        <div className="relative h-full border bg-theme-light rounded-xl overflow-hidden">
          <div
            data-aos="fade-up-sm"
            data-aos-delay="250"
            className="p-8 md:h-full h-[500px] md:p-14 bg-[url('/images/pattern.png')] bg-[length:60%] bg-center bg-no-repeat"
          >
            {feature.map((f: any, i: number) => (
              <div
                key={i}
                className={`absolute w-[90%] md:w-max h-max top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${activeTab === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                <img
                  src={f.image}
                  width={259}
                  height={0}
                  alt="feature image"
                  className="mx-auto"
                />

                <div className="flex items-center gap-4 px-5 py-3 mt-4 bg-tertiary rounded-xl">
                  <DynamicIcon
                    icon={f.icon}
                    className="text-secondary shrink-0 w-14 h-14"
                  />
                  <div>
                    <h3
                      className="pb-1 text-xl text-white"
                      dangerouslySetInnerHTML={{
                        __html: markdownify(f.title),
                      }}
                    />
                    <p
                      className="text-xs text-white/50"
                      dangerouslySetInnerHTML={{ __html: f.card_content }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2">
        <div className="row md:gy-4">
          {feature.map((f: any, i: number) => (
            <div onClick={() => setActiveTab(i)}>
              <div
                className="flex flex-col pb-10 md:pb-7 gap-5 sm:flex-row items-start"
                data-aos="fade-left-sm"
                data-aos-delay={i * 200}
              >
                <div className="p-2 rounded-full bg-secondary/20">
                  <DynamicIcon
                    icon={f.icon}
                    className="text-secondary shrink-0 w-7 h-7"
                  />
                </div>
                <div className="pb-5 hover-border-effect">
                  <h3
                    className="pb-4 text-2xl"
                    dangerouslySetInnerHTML={{
                      __html: markdownify(f.title),
                    }}
                  />
                  <p
                    dangerouslySetInnerHTML={{
                      __html: markdownify(f.description),
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ServiceSlider;
