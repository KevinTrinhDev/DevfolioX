// components/sections/Education.tsx
import { education } from "../../config/education";
import { MapPin, Calendar } from "lucide-react";

export function EducationSection() {
  if (!education.length) return null;

  return (
    <section id="education" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ~/Education
        </h2>

        <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
          Where I&apos;ve been studying.
        </h3>

        <div className="mt-8 space-y-4">
          {education.map((item) => {
            const cleanGpa = item.gpa ? item.gpa.split("/")[0].trim() : null;

            const courseworkText =
              item.coursework && item.coursework.length > 0
                ? item.coursework.join(", ")
                : "";

            const activitiesText =
              item.activities && item.activities.length > 0
                ? item.activities.join(", ")
                : "";

            const awardsText =
              item.awards && item.awards.length > 0
                ? item.awards.join(", ")
                : "";

            const hasStartOrEnd = Boolean(item.start || item.end);
            const hasImage = Boolean(item.imageUrl);

            return (
              <article
                key={item.id}
                className="group rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground transition-transform transition-colors duration-200 hover:-translate-y-[1px] hover:border-accent/60 hover:bg-white/[0.08] sm:flex sm:gap-1 sm:text-base"
              >
                {hasImage && (
                  <div className="mb-3 flex justify-center sm:mb-0 sm:w-40 sm:flex-shrink-0 sm:block">
                    <img
                      src={item.imageUrl as string}
                      alt={item.school}
                      className="h-16 w-16 rounded-md object-cover shadow-sm transition-transform duration-300 ease-out group-hover:scale-105 group-hover:shadow-lg sm:h-full sm:w-full"
                    />
                  </div>
                )}

                {hasImage && (
                  <div className="hidden sm:mx-1 sm:block sm:w-px sm:bg-white/10" />
                )}

                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground sm:text-xl">
                        {item.school}
                      </h4>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        {item.degree}
                        {item.major ? `, ${item.major}` : ""}
                        {item.minor ? `, Minor in ${item.minor}` : ""}
                        {cleanGpa && ` · GPA: ${cleanGpa}`}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground sm:items-end sm:text-sm">
                      {hasStartOrEnd && (
                        <div className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {item.start &&
                              item.end &&
                              `${item.start} — ${item.end}`}
                            {item.start && !item.end && item.start}
                            {!item.start && item.end && item.end}
                            {item.expectedGraduation &&
                              ` · Expected ${item.expectedGraduation}`}
                          </span>
                        </div>
                      )}

                      {!hasStartOrEnd && item.expectedGraduation && (
                        <div className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            Expected Graduation: {item.expectedGraduation}
                          </span>
                        </div>
                      )}

                      {item.location && (
                        <div className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-muted-foreground sm:text-sm">
                    {awardsText && (
                      <p>
                        <span className="font-medium text-foreground">
                          Awards:
                        </span>{" "}
                        {awardsText}
                      </p>
                    )}

                    {activitiesText && (
                      <p>
                        <span className="font-medium text-foreground">
                          Activities and societies:
                        </span>{" "}
                        {activitiesText}
                      </p>
                    )}

                    {courseworkText && (
                      <p>
                        <span className="font-medium text-foreground">
                          Relevant coursework:
                        </span>{" "}
                        {courseworkText}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
