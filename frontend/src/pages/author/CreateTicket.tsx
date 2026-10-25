import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBooksForSelector, useCreateTicket } from "@/hooks/useAuthorApi";

const createTicketSchema = z.object({
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(255, "Subject is too long"),
  description: z.string().trim().min(10, "Please provide at least 10 characters of detail").max(10000),
  bookId: z.string().optional().nullable(),
});

type CreateTicketForm = z.infer<typeof createTicketSchema>;

export function CreateTicket() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedBookId = searchParams.get("bookId");
  const { data: books, isLoading: booksLoading } = useMyBooksForSelector();
  const createTicket = useCreateTicket();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateTicketForm>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: "",
      description: "",
      bookId: preselectedBookId ?? null,
    },
  });

  const selectedBookId = useWatch({ control, name: "bookId" });

  const onSubmit = (values: CreateTicketForm) => {
    createTicket.mutate(values, {
      onSuccess: (ticket) => {
        navigate(`/author/tickets/${ticket.id}`, { replace: true });
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.035em] text-ink sm:text-[1.75rem] sm:leading-tight">
          New Support Ticket
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          Tell us what's going on and our team will get back to you.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Briefly describe the issue"
                {...register("subject")}
              />
              {errors.subject && (
                <p className="text-xs text-danger-600">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookId">Related Book</Label>
              <p className="text-xs text-muted">
                Select a specific book, or leave as General / Account Level for
                account-wide issues.
              </p>
              {booksLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={selectedBookId ?? ""}
                  onValueChange={(v) => setValue("bookId", v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="General / Account Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General / Account Level</SelectItem>
                    {books?.map((book) => (
                      <SelectItem key={book.bookId} value={book.bookId}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Provide as much detail as possible. Include any relevant dates, amounts, or identifiers that will help us investigate."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-danger-600">{errors.description.message}</p>
              )}
            </div>

            <div className="rounded-md border border-dashed border-border bg-surface-2 p-3">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Paperclip className="h-4 w-4" />
                <span>Attachments are not available in this version.</span>
              </div>
            </div>
          </CardContent>
          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTicket.isPending}>
              {createTicket.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {createTicket.isPending ? "Creating…" : "Create Ticket"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
