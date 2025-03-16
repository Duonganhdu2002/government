import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';

class GuidesScreen extends StatelessWidget {
  const GuidesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Sample guide data
    final List<Map<String, dynamic>> guides = [
      {
        'title': 'How to Apply for a Business Permit',
        'description':
            'Learn the step-by-step process to apply for a business permit and what documents you need.',
        'icon': Icons.business,
        'category': 'Business',
      },
      {
        'title': 'Renewing Your Driver\'s License',
        'description':
            'A guide to renew your driver\'s license efficiently with the required documents.',
        'icon': Icons.drive_eta,
        'category': 'Transportation',
      },
      {
        'title': 'Building Permit Application Guide',
        'description':
            'Everything you need to know about applying for a building permit for your construction project.',
        'icon': Icons.home_work,
        'category': 'Construction',
      },
      {
        'title': 'How to Request Birth Certificates',
        'description':
            'Learn how to request and obtain birth certificates for yourself or family members.',
        'icon': Icons.description,
        'category': 'Civil Registry',
      },
      {
        'title': 'Tax Clearance Certificate Guide',
        'description':
            'A comprehensive guide to obtaining your tax clearance certificate.',
        'icon': Icons.receipt_long,
        'category': 'Taxation',
      },
      {
        'title': 'Marriage License Application',
        'description':
            'Step-by-step instructions for applying for a marriage license.',
        'icon': Icons.favorite,
        'category': 'Civil Registry',
      },
      {
        'title': 'Senior Citizen ID Registration',
        'description':
            'How to register and get your Senior Citizen ID with all benefits.',
        'icon': Icons.elderly,
        'category': 'Social Services',
      },
    ];

    // Group guides by category
    final Map<String, List<Map<String, dynamic>>> groupedGuides = {};
    for (var guide in guides) {
      final category = guide['category'] as String;
      if (!groupedGuides.containsKey(category)) {
        groupedGuides[category] = [];
      }
      groupedGuides[category]!.add(guide);
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Guides',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Learn about government services and processes',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.textSecondaryColor,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            // Search bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search guides...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: groupedGuides.length,
                itemBuilder: (context, index) {
                  final category = groupedGuides.keys.elementAt(index);
                  final categoryGuides = groupedGuides[category]!;
                  return _buildCategorySection(
                      context, category, categoryGuides);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategorySection(BuildContext context, String category,
      List<Map<String, dynamic>> guides) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Text(
            category,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppTheme.primaryColor,
                  fontWeight: FontWeight.bold,
                ),
          ),
        ),
        ...guides
            .where((guide) => guide['category'] == category)
            .map((guide) => _buildGuideCard(context, guide)),
        const SizedBox(height: 8),
      ],
    );
  }

  Widget _buildGuideCard(BuildContext context, Map<String, dynamic> guide) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: () {
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  guide['icon'] as IconData,
                  color: AppTheme.primaryColor,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      guide['title'] as String,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      guide['description'] as String,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.textSecondaryColor,
                          ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: AppTheme.textSecondaryColor,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
