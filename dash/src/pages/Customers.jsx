import React, { useState, useEffect } from "react";
import { Customer } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Building2, AlertTriangle, CheckCircle2, Edit, Filter, X, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import AddCustomerDialog from "../components/customer/AddCustomerDialog";
import EditCustomerDialog from "../components/customer/EditCustomerDialog";

export default function Customers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    const data = await Customer.list("-created_date");
    setCustomers(data);
    
    // Extract all unique tags
    const tags = new Set();
    data.forEach(customer => {
      if (customer.tags && Array.isArray(customer.tags)) {
        customer.tags.forEach(tag => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags).sort());
    
    setLoading(false);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      (customer.tags && customer.tags.some(tag => selectedTags.includes(tag)));
    return matchesSearch && matchesTags;
  });

  const handleCustomerClick = (customerId, e) => {
    // Don't navigate if clicking on the edit button
    if (e.target.closest('.edit-button')) {
      return;
    }
    navigate(createPageUrl("CustomerDetail") + `?id=${customerId}`);
  };

  const handleEditClick = (customer, e) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setShowEditDialog(true);
  };

  const toggleTagFilter = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
              Customers
            </h1>
            <p style={{ color: '#7FB8BF' }}>
              Manage and monitor all customer accounts
            </p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="font-semibold"
            style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: '#176B7A' }}>
          <CardContent className="p-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#7FB8BF' }} />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0"
                style={{ 
                  backgroundColor: '#1E8A9C',
                  color: '#E8F4F5'
                }}
              />
            </div>

            {allTags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4" style={{ color: '#7FB8BF' }} />
                  <span className="text-sm font-medium" style={{ color: '#A3CED1' }}>Filter by tags:</span>
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearTagFilters}
                      className="h-6 px-2"
                      style={{ color: '#F49342' }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`cursor-pointer transition-all border-0 ${
                        selectedTags.includes(tag)
                          ? 'bg-[#F4B942] text-[#0A4A52]'
                          : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                      }`}
                      onClick={() => toggleTagFilter(tag)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F4B942' }} />
            <p style={{ color: '#E8F4F5' }}>Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: '#7FB8BF' }} />
            <p className="text-xl mb-2" style={{ color: '#E8F4F5' }}>
              {searchQuery || selectedTags.length > 0 ? "No customers found" : "No customers yet"}
            </p>
            <p style={{ color: '#7FB8BF' }}>
              {searchQuery || selectedTags.length > 0 ? "Try adjusting your search or filters" : "Get started by adding your first customer"}
            </p>
            {!searchQuery && selectedTags.length === 0 && (
              <Button
                onClick={() => setShowAddDialog(true)}
                className="mt-4"
                style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Customer
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCustomers.map((customer, index) => (
              <Card 
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                style={{ backgroundColor: '#176B7A' }}
                onClick={(e) => handleCustomerClick(customer.id, e)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(244, 185, 66, 0.15)' }}
                      >
                        <Building2 className="w-6 h-6" style={{ color: '#F4B942' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1" style={{ color: '#E8F4F5' }}>
                          {customer.company_name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline"
                            className={`border-0 ${
                              customer.status === 'active' 
                                ? 'bg-green-500/20 text-green-300' 
                                : customer.status === 'trial'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}
                          >
                            {customer.status}
                          </Badge>
                          <Badge variant="outline" className="border-0 bg-blue-500/20 text-blue-300">
                            {customer.plan}
                          </Badge>
                          {customer.tags && customer.tags.length > 0 && (
                            <>
                              {customer.tags.map((tag, idx) => (
                                <Badge 
                                  key={idx}
                                  variant="outline" 
                                  className="border-0 bg-purple-500/20 text-purple-300"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 items-center">
                      <div className="flex gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-2xl font-bold" style={{ color: '#E8F4F5' }}>
                              {customer.critical_vulnerabilities || 0}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: '#7FB8BF' }}>Critical</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            <span className="text-2xl font-bold" style={{ color: '#E8F4F5' }}>
                              {customer.vulnerabilities_count || 0}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: '#7FB8BF' }}>Total Issues</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-2xl font-bold" style={{ color: '#E8F4F5' }}>
                              {customer.resolved_vulnerabilities || 0}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: '#7FB8BF' }}>Resolved</p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => handleEditClick(customer, e)}
                        className="edit-button border-[#F4B942] flex-shrink-0"
                        style={{ color: '#F4B942' }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddCustomerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={loadCustomers}
      />

      <EditCustomerDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        customer={editingCustomer}
        onSuccess={loadCustomers}
      />
    </div>
  );
}