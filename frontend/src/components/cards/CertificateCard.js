import React from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import Card from '../common/Card';
import Button from '../common/Button';
import QRCodeContainer from '../common/QRCodeContainer';
import BloodGroupBadge from '../common/BloodGroupBadge';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

const CertificateCard = React.memo(({
  certificate,
  onShare,
  onDownload,
  index = 0,
  style
}) => {
  if (!certificate) return null;

  const donorName = certificate.donorName || certificate.donor?.name || 'Blood Donor';
  const bloodGroup = certificate.bloodGroup || certificate.donor?.bloodGroup || 'O+';
  const certId = certificate.certificateId || certificate._id || 'CERT-REDDROP-8829';
  const date = certificate.issuedAt || certificate.donationDate || '2026-08-01';

  const handleShare = async () => {
    if (onShare) {
      onShare(certificate);
    } else {
      try {
        await Share.share({
          message: `🩸 Verified Blood Donation Certificate for ${donorName} (Blood Group ${bloodGroup}). Certificate ID: ${certId}`
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Card variant="primary" glow index={index} style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandIcon}>🩸</Text>
          <Text style={styles.brandName}>RedDrop AI</Text>
        </View>
        <Text style={styles.certBadge}>VERIFIED CERTIFICATE</Text>
      </View>

      <Text style={styles.title}>Certificate of Appreciation</Text>
      <Text style={styles.subtitle}>This certifies that</Text>

      <Text style={styles.donorName}>{donorName}</Text>
      
      <Text style={styles.bodyText}>
        has generously donated blood to save lives.
      </Text>

      <View style={styles.detailRow}>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>DATE</Text>
          <Text style={styles.detailVal}>{date}</Text>
        </View>

        <BloodGroupBadge group={bloodGroup} size="sm" showLabel />

        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>STATUS</Text>
          <Text style={styles.statusVal}>VERIFIED ✓</Text>
        </View>
      </View>

      <QRCodeContainer value={certId} size={140} />

      <View style={styles.actionRow}>
        <Button
          title="Share Certificate"
          onPress={handleShare}
          variant="secondary"
          size="sm"
          icon={<Text style={{ fontSize: 12 }}>📤</Text>}
          style={{ flex: 1 }}
        />
        {onDownload && (
          <Button
            title="Download"
            onPress={() => onDownload(certificate)}
            variant="outline"
            size="sm"
            style={{ flex: 1 }}
          />
        )}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.md
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  brandIcon: {
    fontSize: 16
  },
  brandName: {
    fontFamily: Typography.heading,
    fontSize: Typography.sizes.caption,
    color: Colors.primary
  },
  certBadge: {
    fontFamily: Typography.mono,
    fontSize: 9,
    color: Colors.success,
    backgroundColor: Colors.successBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.success + '40'
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.sizes.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.xs
  },
  subtitle: {
    fontFamily: Typography.body,
    fontSize: Typography.sizes.caption,
    color: Colors.textMuted,
    marginVertical: 2
  },
  donorName: {
    fontFamily: Typography.heading,
    fontSize: Typography.sizes.h2,
    color: Colors.primary,
    textAlign: 'center',
    marginVertical: Spacing.xs
  },
  bodyText: {
    fontFamily: Typography.body,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
    marginVertical: Spacing.xs
  },
  detailCol: {
    alignItems: 'center'
  },
  detailLabel: {
    fontFamily: Typography.mono,
    fontSize: 9,
    color: Colors.textMuted
  },
  detailVal: {
    fontFamily: Typography.bodyMedium,
    fontSize: Typography.sizes.caption,
    color: Colors.textPrimary,
    marginTop: 2
  },
  statusVal: {
    fontFamily: Typography.bodyMedium,
    fontSize: Typography.sizes.caption,
    color: Colors.success,
    marginTop: 2
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginTop: Spacing.sm
  }
});

export default CertificateCard;
