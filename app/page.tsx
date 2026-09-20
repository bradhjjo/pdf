import { Splitter } from "@/components/Splitter";
import { FakeDoor } from "@/components/FakeDoor";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Split &amp; Rename PDF</h1>
        <p className="max-w-2xl text-ink-soft">
          Split a large PDF into separate documents and name them automatically.
          Everything runs in your browser — your files are never uploaded.
        </p>
      </section>

      <Splitter>
        <div className="grid gap-4 sm:grid-cols-2">
          <FakeDoor
            title="Auto Detect Documents"
            description="Find where each invoice or statement starts, so you do not have to click every split."
            cta="Try Auto Detect"
            event="auto_detect_clicked"
            source="auto_detect"
          />
          <FakeDoor
            title="Auto Rename"
            description="Name every file from its vendor, invoice number and date."
            cta="Try Auto Rename"
            event="auto_detect_clicked"
            source="auto_rename"
          />
        </div>
      </Splitter>

      <section className="grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
        <div>
          <h2 className="font-medium">Nothing is uploaded</h2>
          <p className="mt-1 text-sm text-ink-soft">
            The PDF is opened and rewritten by your own browser. No server ever sees it,
            so it works on client files and payroll runs too.
          </p>
        </div>
        <div>
          <h2 className="font-medium">No page goes missing</h2>
          <p className="mt-1 text-sm text-ink-soft">
            A running count shows how many of the original pages ended up in the output,
            and warns you about anything deleted or duplicated.
          </p>
        </div>
        <div>
          <h2 className="font-medium">Names that make sense</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Where a page carries an invoice number or a date, that becomes the file name.
            You can edit any of them before downloading.
          </p>
        </div>
      </section>

      <section className="border-t border-line pt-8">
        <FakeDoor
          title="Pro — $9/month"
          description="Batch several PDFs at once, remember your naming rules, and keep a history of past runs."
          cta="See Pro"
          event="pro_clicked"
          source="pro"
        />
      </section>
    </div>
  );
}
