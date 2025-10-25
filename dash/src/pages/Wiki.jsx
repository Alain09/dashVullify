import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Search, 
  FileText, 
  Video, 
  Code,
  ExternalLink,
  Plus
} from "lucide-react";

export default function Wiki() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Getting Started", count: 12, icon: BookOpen, color: "#4CAF50" },
    { name: "API Documentation", count: 45, icon: Code, color: "#F4B942" },
    { name: "Tutorials", count: 23, icon: Video, color: "#1E8A9C" },
    { name: "Best Practices", count: 18, icon: FileText, color: "#F49342" },
  ];

  const articles = [
    { title: "Quick Start Guide", category: "Getting Started", views: "1.2K", updated: "2 days ago" },
    { title: "API Authentication", category: "API Documentation", views: "890", updated: "1 week ago" },
    { title: "Configuring Scan Schedules", category: "Tutorials", views: "654", updated: "3 days ago" },
    { title: "Security Best Practices", category: "Best Practices", views: "2.1K", updated: "1 day ago" },
    { title: "Integration Setup", category: "Tutorials", views: "432", updated: "5 days ago" },
    { title: "Webhook Configuration", category: "API Documentation", views: "567", updated: "4 days ago" },
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
              Knowledge Base
            </h1>
            <p style={{ color: '#7FB8BF' }}>
              Documentation, guides, and resources
            </p>
          </div>
          <Button 
            className="font-semibold"
            style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </div>

        <Card className="border-0 shadow-lg mb-8" style={{ backgroundColor: '#176B7A' }}>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#7FB8BF' }} />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0"
                style={{ 
                  backgroundColor: '#1E8A9C',
                  color: '#E8F4F5'
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {categories.map((category, index) => (
            <Card 
              key={index}
              className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
              style={{ backgroundColor: '#176B7A' }}
            >
              <CardContent className="p-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(244, 185, 66, 0.15)' }}
                >
                  <category.icon className="w-6 h-6" style={{ color: category.color }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#E8F4F5' }}>
                  {category.name}
                </h3>
                <p className="text-sm" style={{ color: '#7FB8BF' }}>
                  {category.count} articles
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle style={{ color: '#E8F4F5' }}>Recent Articles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y" style={{ borderColor: '#1E8A9C' }}>
              {articles.map((article, index) => (
                <div key={index} className="p-6 hover:bg-[#1E8A9C] transition-colors cursor-pointer">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2" style={{ color: '#E8F4F5' }}>
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-0 bg-blue-500/20 text-blue-300">
                          {article.category}
                        </Badge>
                        <span className="text-sm" style={{ color: '#7FB8BF' }}>
                          {article.views} views
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm" style={{ color: '#7FB8BF' }}>
                        Updated {article.updated}
                      </span>
                      <ExternalLink className="w-5 h-5" style={{ color: '#F4B942' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}