import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { contactsTable } from "@workspace/db/schema";

interface UpsertContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source: string;
  tag: string;
  notes?: string;
}

/**
 * Upsert a contact into the CRM.
 * - Creates a new contact if the email doesn't exist yet.
 * - If the email already exists, merges the new tag and fills in
 *   any blank name/phone fields without overwriting existing data.
 * Silently swallows errors so it never breaks the calling route.
 */
export async function upsertContact(input: UpsertContactInput): Promise<void> {
  try {
    const email = input.email.trim().toLowerCase();
    if (!email) return;

    const [existing] = await db
      .select()
      .from(contactsTable)
      .where(eq(contactsTable.email, email))
      .limit(1);

    if (!existing) {
      await db.insert(contactsTable).values({
        firstName: input.firstName?.trim() || "Unknown",
        lastName: input.lastName?.trim() || "",
        email,
        phone: input.phone?.trim() || "",
        source: input.source,
        tags: input.tag,
        notes: input.notes?.trim() || "",
        optedOut: false,
      });
      console.log(`[contacts] New contact added: ${email} (${input.source})`);
      return;
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    // Merge tag without duplicating
    const existingTags = existing.tags ?? "";
    if (!existingTags.split(",").map(t => t.trim()).includes(input.tag)) {
      updates.tags = existingTags ? `${existingTags},${input.tag}` : input.tag;
    }

    // Fill in blank fields only — never overwrite existing data
    if (!existing.firstName && input.firstName?.trim()) updates.firstName = input.firstName.trim();
    if (!existing.lastName && input.lastName?.trim()) updates.lastName = input.lastName.trim();
    if (!existing.phone && input.phone?.trim()) updates.phone = input.phone.trim();

    await db
      .update(contactsTable)
      .set(updates)
      .where(eq(contactsTable.id, existing.id));

    console.log(`[contacts] Existing contact updated: ${email} (+${input.tag})`);
  } catch (err) {
    console.error("[contacts] upsertContact failed:", err);
  }
}
