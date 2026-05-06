import { FaShieldHalved, FaLock, FaBuildingColumns } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { markdownify } from "@/lib/utils/textConverter";
import React, { useState } from "react";

const iconMap: Record<string, IconType> = {
  FaShieldHalved,
  FaLock,
  FaBuildingColumns,
};

const ServiceSlider = ({ feature }: { feature: any }) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <>
      {/* Preview panel */}
      <div className="w-full md:w-1/2">
        <div className="relative rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand/60 via-brand to-brand/60" />

          <div className="relative p-6 md:p-8">
            <div className="relative h-[260px] flex items-center justify-center">
              {feature.map((f: any, i: number) => (
                <div
                  key={i}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                    activeTab === i
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <img
                    src={f.image}
                    alt={f.title}
                    className="w-full max-w-[300px] drop-shadow-sm"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            <div className="relative mt-4 h-[72px]">
              {feature.map((f: any, i: number) => {
                const Icon = iconMap[f.icon];
                return (
                  <div
                    key={i}
                    className={`absolute inset-x-0 top-0 transition-all duration-500 ${
                      activeTab === i
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-border/60 bg-white shadow-sm">
                      {Icon && (
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10 shrink-0">
                          <Icon className="text-brand w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3
                          className="text-base font-semibold text-dark leading-tight"
                          dangerouslySetInnerHTML={{
                            __html: markdownify(f.title),
                          }}
                        />
                        <p
                          className="text-xs text-light mt-0.5 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: f.card_content }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab list */}
      <div className="w-full md:w-1/2">
        <div className="flex flex-col gap-2">
          {feature.map((f: any, i: number) => {
            const Icon = iconMap[f.icon];
            const isActive = activeTab === i;
            return (
              <div
                key={i}
                onClick={() => setActiveTab(i)}
                className={`group cursor-pointer rounded-xl border p-5 transition-all duration-300 ${
                  isActive
                    ? "border-brand/30 bg-brand/[0.04] shadow-sm"
                    : "border-transparent bg-transparent hover:bg-theme-light/60"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-colors duration-300 ${
                      isActive ? "bg-brand/15" : "bg-theme-light"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-5 h-5 transition-colors duration-300 ${
                          isActive ? "text-brand" : "text-light"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold leading-tight transition-colors duration-300 ${
                        isActive ? "text-dark" : "text-dark/80"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: markdownify(f.title),
                      }}
                    />
                    <p
                      className={`mt-2 text-sm leading-relaxed transition-colors duration-300 ${
                        isActive ? "text-dark/70" : "text-light"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: markdownify(f.description),
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ServiceSlider;
