// @vitest-environment node
/**
 * End-to-end checks against the real BridgeLIB backend using isolated test accounts.
 *
 * Required env (tests are skipped when missing):
 *   E2E_STUDENT_EMAIL, E2E_STUDENT_PASSWORD  – a dedicated student test account
 *   E2E_ADMIN_EMAIL,   E2E_ADMIN_PASSWORD    – a dedicated admin test account
 * Optional:
 *   E2E_ALLOW_WRITES=1 – also run checks that submit an exam attempt and probe
 *                        forbidden writes (any accidental change is reverted).
 *
 * Uses only the public publishable key — never a service-role key.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const URL = "https://qlwtccmvddhgdnknrgnh.supabase.co";
const KEY = "sb_publishable_wKuleQ5jc2evn7g6qt7Qhw_S8UKrWOg";
const env = process.env;
const student = { email: env["E2E_STUDENT_EMAIL"], password: env["E2E_STUDENT_PASSWORD"] };
const admin = { email: env["E2E_ADMIN_EMAIL"], password: env["E2E_ADMIN_PASSWORD"] };
const allowWrites = env["E2E_ALLOW_WRITES"] === "1";
const hasStudent = Boolean(student.email && student.password);
const hasAdmin = Boolean(admin.email && admin.password);

function client() {
  return createClient(URL, KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signIn(c: SupabaseClient, email: string, password: string) {
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

const TABLES = [
  "profiles",
  "classes",
  "schools",
  "lessons",
  "exam_questions",
  "exam_question_answers",
];

describe("anonymous visitor", () => {
  it('can browse the public subject catalogue',async()=>{
    const {error}=await client().from('subjects').select('id,name,description').limit(1);
    expect(error).toBeNull();
  });
  it.each(TABLES)("cannot read %s", async (table) => {
    const { data, error } = await client().from(table).select("*").limit(1);
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it("cannot sign in with a wrong password", async () => {
    const { error } = await client().auth.signInWithPassword({
      email: "nobody-e2e@example.invalid",
      password: "wrong-password-123",
    });
    expect(error).not.toBeNull();
  });
});

describe.skipIf(!hasStudent)("student account", () => {
  const c = client();
  let userId = "";

  beforeAll(async () => {
    if (!student.email || !student.password) throw new Error('Student test account is not configured.');
    userId = (await signIn(c, student.email, student.password)).id;
  });
  afterAll(async () => {
    await c.auth.signOut();
  });

  it("reads its own profile and is not an admin", async () => {
    const { data, error } = await c.from("profiles").select("id,role").eq("id", userId).single();
    expect(error).toBeNull();
    expect(data?.role).not.toBe("admin");
  });

  it("cannot see other users' profiles", async () => {
    const { data } = await c.from("profiles").select("id");
    expect((data ?? []).every((p) => p.id === userId)).toBe(true);
  });

  it("only sees published exam questions", async () => {
    const { data, error } = await c.from("exam_questions").select("id,is_published").limit(200);
    expect(error).toBeNull();
    expect((data ?? []).every((q) => q.is_published === true)).toBe(true);
  });

  it("cannot read the answer key table", async () => {
    const { data, error } = await c.from("exam_question_answers").select("*").limit(1);
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it("can list subjects for practice", async () => {
    const { error } = await c.from("subjects").select("id,name").limit(5);
    expect(error).toBeNull();
  });

  it.skipIf(!allowWrites)("cannot promote itself to admin", async () => {
    await c.from("profiles").update({ role: "admin" }).eq("id", userId);
    const { data } = await c.from("profiles").select("role").eq("id", userId).single();
    if (data?.role === "admin") {
      await c.from("profiles").update({ role: "student" }).eq("id", userId);
    }
    expect(data?.role).not.toBe("admin");
  });

  it.skipIf(!allowWrites)("cannot create subjects", async () => {
    const name = `E2E-TEST-${Date.now()}`;
    const { error } = await c.from("subjects").insert({ name });
    if (!error) await c.from("subjects").delete().eq("name", name);
    expect(error).not.toBeNull();
  });

  it.skipIf(!allowWrites)("submits an exam attempt and gets a server-graded score", async () => {
    const { data: qs } = await c
      .from("exam_questions")
      .select("id,options")
      .eq("is_published", true)
      .limit(1);
    const q = qs?.[0] as { id: number; options: Array<{ id: string }> } | undefined;
    if (!q) return; // no published questions to practise
    const { data, error } = await c.rpc("submit_exam_attempt", {
      p_answers: [{ question_id: q.id, selected_option: q.options[0]?.id }],
    });
    expect(error).toBeNull();
    expect(typeof (data as { score: unknown }).score).toBe("number");
    expect((data as { total_questions: number }).total_questions).toBeGreaterThan(0);
  });
});

describe.skipIf(!hasAdmin)("admin account", () => {
  const c = client();
  let userId = "";

  beforeAll(async () => {
    if (!admin.email || !admin.password) throw new Error('Admin test account is not configured.');
    userId = (await signIn(c, admin.email, admin.password)).id;
  });
  afterAll(async () => {
    await c.auth.signOut();
  });

  it("has the admin role", async () => {
    const { data, error } = await c.from("profiles").select("role").eq("id", userId).single();
    expect(error).toBeNull();
    expect(data?.role).toBe("admin");
  });

  it.each(["subjects", "lessons", "exam_questions"])("can read %s for management", async (t) => {
    const { error } = await c.from(t).select("id").limit(1);
    expect(error).toBeNull();
  });
});
