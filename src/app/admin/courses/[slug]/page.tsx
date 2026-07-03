// src/app/admin/courses/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { styles, difficultyBadge } from "@/lib/styles";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

async function updateCourse(slug: string, formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const difficulty = formData.get("difficulty") as string;
  const published = formData.get("published") === "on";

  await prisma.course.update({
    where: { slug },
    data: { title, description, difficulty, published },
  });

  redirect(`/admin/courses/${slug}`);
}

async function deleteCourse(slug: string) {
  "use server";
  await prisma.course.delete({ where: { slug } });
  redirect("/admin/courses");
}

async function createModule(courseId: string, slug: string, formData: FormData) {
  "use server";
  const title = formData.get("module_title") as string;
  const description = formData.get("module_description") as string;
  const count = await prisma.module.count({ where: { courseId } });
  await prisma.module.create({
    data: { courseId, title, description, order: count + 1 },
  });
  redirect(`/admin/courses/${slug}`);
}

async function updateModule(moduleId: string, slug: string, formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  await prisma.module.update({
    where: { id: moduleId },
    data: { title, description },
  });
  redirect(`/admin/courses/${slug}`);
}

async function deleteModule(moduleId: string, slug: string) {
  "use server";
  await prisma.module.delete({ where: { id: moduleId } });
  redirect(`/admin/courses/${slug}`);
}

export default async function AdminCourseEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) notFound();

  const updateCourseWithSlug = updateCourse.bind(null, slug);
  const deleteCourseWithSlug = deleteCourse.bind(null, slug);
  const createModuleWithIds = createModule.bind(null, course.id, slug);

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/courses" className={`${styles.label} hover:text-slate-700`}>
          ← Back to courses
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/courses/${slug}`} target="_blank" className={styles.ctaGhost}>
            Preview
          </Link>
          <form action={deleteCourseWithSlug}>
            <button
              type="submit"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              Delete course
            </button>
          </form>
        </div>
      </div>

      {/* Course details */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Course details</h2>
        <form action={updateCourseWithSlug} className="mt-4 space-y-4">
          <div>
            <label className={styles.formLabel}>Title</label>
            <input name="title" defaultValue={course.title} required className={styles.formInput} />
          </div>
          <div>
            <label className={styles.formLabel}>Description</label>
            <textarea name="description" defaultValue={course.description} required rows={3} className={styles.formTextarea} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={styles.formLabel}>Difficulty</label>
              <select name="difficulty" defaultValue={course.difficulty} className={styles.formSelect}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" name="published" defaultChecked={course.published} className="rounded" />
                Published
              </label>
            </div>
          </div>
          <button type="submit" className={styles.enrollBtn}>Save changes</button>
        </form>
      </div>

      {/* Modules */}
      <div className={`mt-6 ${styles.card}`}>
        <h2 className={styles.sectionTitle}>Modules</h2>
        <div className="space-y-3 mt-4">
          {course.modules.length === 0 && (
            <p className={styles.label}>No modules yet — add one below.</p>
          )}
          {course.modules.map((module, i) => {
            const updateModuleWithIds = updateModule.bind(null, module.id, slug);
            const deleteModuleWithIds = deleteModule.bind(null, module.id, slug);

            return (
              <div key={module.id} className="rounded-2xl border border-slate-200 p-4">
                <details>
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <div className="flex items-center gap-3">
                      <span className={styles.moduleNumber}>{i + 1}</span>
                      <div>
                        <p className="font-medium text-slate-900">{module.title}</p>
                        <p className={`text-xs ${styles.label}`}>
                          {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/courses/${slug}/modules/${module.id}`}
                        className={styles.ctaPrimary}
                      >
                        Manage lessons
                      </Link>
                      <form action={deleteModuleWithIds}>
                        <button
                          type="submit"
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </summary>

                  {/* Edit module form */}
                  <form action={updateModuleWithIds} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    <div>
                      <label className={styles.formLabel}>Title</label>
                      <input name="title" defaultValue={module.title} required className={styles.formInput} />
                    </div>
                    <div>
                      <label className={styles.formLabel}>Description</label>
                      <input name="description" defaultValue={module.description ?? ""} className={styles.formInput} />
                    </div>
                    <button type="submit" className={styles.ctaPrimary}>Save module</button>
                  </form>
                </details>
              </div>
            );
          })}
        </div>

        {/* Add module */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Add module</h3>
          <form action={createModuleWithIds} className="space-y-3">
            <div>
              <label className={styles.formLabel}>Module title</label>
              <input name="module_title" required className={styles.formInput} placeholder="e.g. Understanding Money Basics" />
            </div>
            <div>
              <label className={styles.formLabel}>Description (optional)</label>
              <input name="module_description" className={styles.formInput} placeholder="Short description of this module" />
            </div>
            <button type="submit" className={styles.ctaPrimary}>Add module</button>
          </form>
        </div>
      </div>
    </div>
  );
}