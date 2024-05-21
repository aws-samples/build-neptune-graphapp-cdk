import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { trim } from "lodash-es";

import {
  BookOpenText,
  Building2,
  GraduationCap,
  Heart,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Result } from "@/types/types";
import { Separator } from "@/components/ui/separator";
import { Icons, queryGetProfile, queryGetRelationName } from "@/lib/utils";
import { radioGroupValue } from "@/data/data";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/_layout/")({
  component: Dashboard,
});

const FormSchema = z.object({
  value: z.string(),
  label: z.string(),
  description: z.string(),
});

function onSubmit(data: z.infer<typeof FormSchema>) {
  toast({
    title: "You submitted the following values:",
    description: (
      <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        <code className="text-white">{JSON.stringify(data, null, 2)}</code>
      </pre>
    ),
  });
}
export function Dashboard() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const refName = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("person");
  const [result, setResult] = useState<
    Array<{
      name: string;
    }>
  >([]);
  const [profile, setProfile] = useState<
    Array<{
      search_name: string;
      usage?: string;
      belong_to?: string;
      authored_by?: string;
      affiliated_with?: string;
      people?: string;
      made_by?: string | null;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const filedChange = (curr: string) => {
    setValue(curr);
  };

  const executeQuery = async () => {
    const name = refName.current!.value;
    if (!name) {
      return;
    }
    setIsLoading(true);
    getInformation(name);
    try {
      const result = await queryGetRelationName(name, value);

      setResult(result.data!.getRelationName!);
      setIsLoading(false);
      toast({
        title: `Successfully query`,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Query Error",
        description: error.errors[0].message,
      });
    }
  };

  const getInformation = async (name: string) => {
    try {
      const result = await queryGetProfile(name, value);
      setProfile(result.data.getProfile);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Query Error",
        description: error.errors[0].message,
      });
    }
  };

  useEffect(() => {
    setValue("person");
  }, []);
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="col-span-2 gap-2 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                Selection
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="value"
                  render={() => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={filedChange}
                          defaultValue={value}
                          className="flex flex-col space-y-1"
                        >
                          {radioGroupValue.map((object, key: number) => (
                            <FormItem
                              className="flex items-start space-x-3 space-y-0"
                              key={key.toString()}
                            >
                              <FormControl>
                                <RadioGroupItem value={object.value} />
                              </FormControl>
                              <FormLabel>{object.label}</FormLabel>
                              <FormDescription>
                                {object.description}
                              </FormDescription>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Input
                  id="name"
                  required={true}
                  placeholder="Enter name"
                  ref={refName}
                  disabled={isLoading}
                />
                <Button
                  className="items-left"
                  onClick={executeQuery}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1">
        <Card className="flex flex-col" x-chunk="dashboard-05-chunk-1">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                Search Overview
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col p-6 text-sm">
            {isLoading ? (
              <>
                <div className="flex flex-col space-y-3">
                  <Skeleton className="flex h-[100px] rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-3">
                  <div
                    className="font-semibold flex flex-row justify-start"
                    key={"search"}
                  >
                    <Search />
                    <span className="text-muted-foreground px-4 text-base">
                      {refName.current?.value ? refName.current.value : ""}
                    </span>
                  </div>

                  {profile.length !== 0 ? (
                    profile.map((value, index: number) => (
                      <div className="grid gap-3" key={index.toString()}>
                        {value.affiliated_with !== null && (
                          <>
                            <Separator />
                            <div className="flex flex-row justify-start">
                              <Building2 />
                              <span className="text-muted-foreground px-4 text-base ">
                                Institution
                              </span>
                            </div>
                            {trim(value.affiliated_with, "[]")}
                            <Separator />
                          </>
                        )}
                        {value.usage !== null && (
                          <>
                            <div className="flex flex-row justify-start">
                              <Heart />
                              <span className="text-muted-foreground px-4 text-base">
                                Products to use
                              </span>
                            </div>
                            {trim(value.usage, "[]")}
                            <Separator />
                          </>
                        )}
                        {value.belong_to !== null && (
                          <>
                            <div className="flex flex-row justify-start">
                              <GraduationCap />
                              <span className="text-muted-foreground px-4 text-base">
                                Affiliated academic society
                              </span>
                            </div>
                            {trim(value.belong_to, "[]")}

                            <Separator />
                          </>
                        )}
                        {value.authored_by !== null && (
                          <>
                            <div className="flex flex-row justify-start">
                              <BookOpenText />
                              <span className="text-muted-foreground px-4 text-base">
                                Paper
                              </span>
                            </div>
                            {trim(value.authored_by, "[]")}
                            <Separator />
                          </>
                        )}
                        {value.people !== null && (
                          <>
                            <div className="flex flex-row justify-start">
                              <Users />
                              <span className="text-muted-foreground px-4 text-base">
                                Academic member
                              </span>
                            </div>
                            {trim(value.people, "[]")}
                            <Separator />
                          </>
                        )}
                        {value.made_by !== null && (
                          <>
                            <div className="flex flex-row justify-start">
                              <Building2 />
                              <span className="text-muted-foreground px-4 text-base">
                                Pharmaceutical company
                              </span>
                            </div>
                            {trim(value.made_by, "[]")}
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="col-span-3">
        <Card x-chunk="dashboard-05-chunk-1">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                Result
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <>
                <div className="space-y-2">
                  <Skeleton className="flex h-4" />
                  <Skeleton className="flex h-4" />
                </div>
              </>
            ) : (
              <>
                {result.length !== 0 ? (
                  <div className="grid gap-3" key="result">
                    {result.map((data: Result, index: number) => (
                      <div key={index.toString()}>
                        <div className="flex flex-row justify-start pb-4">
                          <UserRound />
                          <p className="pl-8">{data.name}</p>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                ) : (
                  <CardDescription>No results</CardDescription>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
