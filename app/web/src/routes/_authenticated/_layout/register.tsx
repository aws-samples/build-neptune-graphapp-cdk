import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { includes, find, isEmpty } from "lodash-es";
import { Icons } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { generateClient } from "aws-amplify/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { registerInfo } from "@/api/appsync/mutation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { selectEdgeItem, selectVertexItem } from "@/data/data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { EdgeItem, ErrorMessage, InsertDataInput } from "@/types/types";

export const Route = createFileRoute("/_authenticated/_layout/register")({
  component: Register,
});

const FormSchema = z.object({
  type: z.enum(["vertex", "edge"], {
    required_error: "You need to select a type.",
  }),
});

const radioGroupValue = [
  {
    type: "vertex",
  },
  {
    type: "edge",
  },
];

function Register() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [value, setValue] = useState("vertex");
  const [edge, setEdge] = useState("");
  const [vertex, setVertex] = useState("");
  const [property, setProperty] = useState("");
  const name = useRef<HTMLInputElement>(null);
  const [edgeData, setEdgeData] = useState<EdgeItem>({
    value: "",
    description: "",
    source: "",
    sourceLabel: "",
    destination: "",
    destLabel: "",
  });
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    setProperty("");
    setDestination("");
    setSource("");
  }, [vertex, edge]);

  useEffect(() => {
    setVertex("");
    setEdge("");
    setDestination("");
    setSource("");
  }, [value]);
  const client = generateClient();

  const handleChange = (curr: string) => {
    if (value === "vertex") {
      setVertex(curr);
    } else {
      setEdge(curr);
      const data = find(selectEdgeItem, ["value", curr]);
      setEdgeData(data!);
    }
  };

  const onSubmitRegister = async () => {
    setIsLoading(true);

    try {
      const inputName = name.current?.value || "";
      if (value === "vertex") {
        if (isEmpty(inputName)) {
          toast({
            variant: "destructive",
            title: "Register error",
            description: "No name",
          });
          setIsLoading(false);
          return;
        }
      } else {
        if (isEmpty(source) || isEmpty(destination)) {
          toast({
            variant: "destructive",
            title: "Register error",
            description: "No source or destination",
          });
          setIsLoading(false);
          return;
        }
      }
      const input: InsertDataInput = {
        value: value,
        name: inputName,
        edge: edge,
        vertex: vertex,
        property: property,
        source: source,
        sourceLabel: edgeData.sourceLabel,
        destination: destination,
        destLabel: edgeData.destLabel,
      };
      console.log(input);
      await client.graphql({
        query: registerInfo,
        variables: {
          InsertDataInput: input,
        },
      });
      toast({
        title: `Successfully register your ${value}`,
      });
      setIsLoading(false);
      setDestination("");
      setSource("");
    } catch (error) {
      const errorMessage = error as ErrorMessage;
      toast({
        variant: "destructive",
        title: "Register error",
        description: errorMessage.message,
      });
      setIsLoading(false);
    }
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  return (
    <main className="grid items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
      <div className="col-span-2 gap-2 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="sm:col-span-4" x-chunk="dashboard-05-chunk-0">
          <CardHeader className="flex flex-row items-start">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                Vertex/Edge registration
              </CardTitle>
              <CardDescription className="text-start">
                Select vertex or edge which you would like to register to Amazon
                Neptune and then select label or edge name. Next input the name
                for vertex, or input the source name and destination name for
                edge.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 ">
            <Form {...form}>
              <form className="flex flex-col">
                <div className="flex flex-row justify-evenly ">
                  <FormField
                    control={form.control}
                    name="type"
                    render={() => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={(curr) => setValue(curr)}
                            defaultValue="vertex"
                            className="flex flex-col space-y-1"
                          >
                            {radioGroupValue.map((object, index: number) => (
                              <FormItem
                                className="flex items-start space-x-3 space-y-0"
                                key={index.toString()}
                              >
                                <FormControl>
                                  <RadioGroupItem value={object.type} />
                                </FormControl>
                                <FormLabel className="">
                                  {object.type}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="">
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Select onValueChange={handleChange}>
                          <SelectTrigger
                            id="type"
                            aria-label={
                              value === "vertex"
                                ? "Select label"
                                : "Select edge name"
                            }
                            className="w-[240px]"
                          >
                            <SelectValue
                              placeholder={
                                value === "vertex"
                                  ? "Select label"
                                  : "Select edge name"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {value == "vertex"
                              ? selectVertexItem.map((item, index: number) => (
                                  <SelectItem
                                    value={item.value}
                                    key={index.toString()}
                                  >
                                    {item.description}
                                  </SelectItem>
                                ))
                              : selectEdgeItem.map((item, index: number) => (
                                  <SelectItem
                                    value={item.value}
                                    key={index.toString()}
                                  >
                                    {item.description}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {value === "vertex" ? (
                  <div className="flex flex-row py-8 space-x-8">
                    <Input
                      id="name"
                      required={true}
                      placeholder="Enter Name"
                      ref={name}
                      disabled={isLoading}
                      className="flex basis-1/2"
                    />
                    {includes(["person", "paper"], vertex) ? (
                      <Input
                        id={vertex === "person" ? "speciality" : "publich date"}
                        required={true}
                        placeholder={
                          vertex === "person"
                            ? "Enter speciality"
                            : "Enter publich date"
                        }
                        value={property}
                        onChange={(e) => setProperty(e.target.value)}
                        disabled={isLoading}
                        className="flex basis-1/2"
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-row py-8 space-x-8">
                    <Input
                      id="source"
                      required={true}
                      placeholder="Source"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      disabled={isLoading}
                    />
                    <Input
                      id="destination"
                      required={true}
                      placeholder="Destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    className="items-left"
                    onClick={onSubmitRegister}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
            {value === "edge" ? (
              <div className="flex justify-center py-8">
                <Breadcrumb className="">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Source</CardDescription>
                            <CardTitle className="text-2xl">
                              {edgeData.source} ({edgeData.sourceLabel})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-lg text-muted-foreground">
                              name:{source}
                            </div>
                          </CardContent>
                        </Card>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Edge</CardDescription>
                          <CardTitle className="text-4xl"></CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-muted-foreground">
                            {edge}
                          </div>
                        </CardContent>
                      </Card>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Destination</CardDescription>
                            <CardTitle className="text-2xl">
                              {edgeData.destination} ({edgeData.destLabel})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-lg text-muted-foreground">
                              name:{destination}
                            </div>
                          </CardContent>
                        </Card>
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            ) : (
              <></>
            )}
            <></>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
